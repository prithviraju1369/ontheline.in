const express = require('express');
const { v4: uuidv4 } = require('uuid');
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const authMiddleware = require('../middleware/auth');
const ondcService = require('../services/ondcService');
const logger = require('../utils/logger');

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// Get all orders for user
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    
    const query = { userId: req.userId };
    if (status) {
      query.status = status;
    }

    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Order.countDocuments(query);

    res.json({
      orders,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      totalOrders: count
    });
  } catch (error) {
    logger.error('Get orders error:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// Get single order
router.get('/:orderId', async (req, res) => {
  try {
    const order = await Order.findOne({
      orderId: req.params.orderId,
      userId: req.userId
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json({ order });
  } catch (error) {
    logger.error('Get order error:', error);
    res.status(500).json({ error: 'Failed to fetch order' });
  }
});

// Create order from cart
router.post('/create', async (req, res) => {
  try {
    const { billingAddress, deliveryAddress, paymentMethod } = req.body;

    if (!billingAddress || !deliveryAddress) {
      return res.status(400).json({ error: 'Billing and delivery addresses are required' });
    }

    // Get cart
    const cart = await Cart.findOne({ userId: req.userId });
    
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ error: 'Cart is empty' });
    }

    // Generate IDs
    const orderId = `ORD-${Date.now()}-${uuidv4().substring(0, 8)}`;
    const transactionId = uuidv4();
    const messageId = uuidv4();

    // Group items by provider
    const providerGroups = {};
    cart.items.forEach(item => {
      if (!providerGroups[item.providerId]) {
        providerGroups[item.providerId] = {
          providerId: item.providerId,
          providerName: item.providerName,
          bppId: item.bppId,
          bppUri: item.bppUri,
          items: []
        };
      }
      providerGroups[item.providerId].items.push(item);
    });

    // Calculate total
    let totalAmount = 0;
    const orderItems = cart.items.map(item => {
      const itemTotal = item.price.value * item.quantity;
      totalAmount += itemTotal;
      return {
        id: item.itemId,
        name: item.itemName,
        quantity: item.quantity,
        price: item.price.value,
        descriptor: item.itemDescriptor,
        fulfillmentId: item.fulfillmentId
      };
    });

    // Create order in database
    const order = new Order({
      userId: req.userId,
      orderId,
      transactionId,
      messageId,
      provider: {
        id: Object.values(providerGroups)[0].providerId,
        descriptor: {
          name: Object.values(providerGroups)[0].providerName
        }
      },
      items: orderItems,
      billing: billingAddress,
      fulfillment: {
        type: 'Delivery',
        end: {
          contact: {
            email: req.user.email,
            phone: req.user.phone
          },
          location: {
            gps: `${deliveryAddress.latitude},${deliveryAddress.longitude}`,
            address: deliveryAddress
          }
        }
      },
      payment: {
        type: paymentMethod || 'ON-ORDER',
        status: 'NOT-PAID',
        amount: totalAmount,
        currency: 'INR'
      },
      quote: {
        price: {
          currency: 'INR',
          value: totalAmount.toString()
        },
        breakup: [{
          title: 'Base Price',
          price: {
            currency: 'INR',
            value: totalAmount.toString()
          }
        }]
      },
      status: 'CREATED',
      ondcData: {
        bppId: Object.values(providerGroups)[0].bppId,
        bppUri: Object.values(providerGroups)[0].bppUri
      }
    });

    await order.save();

    // Clear cart
    cart.items = [];
    await cart.save();

    logger.info('Order created', { userId: req.userId, orderId });

    res.status(201).json({
      message: 'Order created successfully',
      order
    });
  } catch (error) {
    logger.error('Create order error:', error);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

// Update order status
router.put('/:orderId/status', async (req, res) => {
  try {
    const { status } = req.body;

    const order = await Order.findOne({
      orderId: req.params.orderId,
      userId: req.userId
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    order.status = status;
    order.updatedAt = Date.now();
    await order.save();

    logger.info('Order status updated', { userId: req.userId, orderId: order.orderId, status });

    res.json({
      message: 'Order status updated',
      order
    });
  } catch (error) {
    logger.error('Update order status error:', error);
    res.status(500).json({ error: 'Failed to update order status' });
  }
});

// Get order tracking
router.get('/:orderId/track', async (req, res) => {
  try {
    const order = await Order.findOne({
      orderId: req.params.orderId,
      userId: req.userId
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Call ONDC track API
    const trackResult = await ondcService.track({
      transactionId: order.transactionId,
      bppId: order.ondcData.bppId,
      bppUri: order.ondcData.bppUri,
      orderId: order.orderId
    });

    res.json({
      order,
      tracking: trackResult
    });
  } catch (error) {
    logger.error('Track order error:', error);
    res.status(500).json({ error: 'Failed to track order' });
  }
});

// Cancel order
router.post('/:orderId/cancel', async (req, res) => {
  try {
    const { reasonId, reason } = req.body;

    const order = await Order.findOne({
      orderId: req.params.orderId,
      userId: req.userId
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    if (order.status === 'CANCELLED' || order.status === 'COMPLETED') {
      return res.status(400).json({ error: 'Order cannot be cancelled' });
    }

    // Call ONDC cancel API
    await ondcService.cancel({
      transactionId: order.transactionId,
      bppId: order.ondcData.bppId,
      bppUri: order.ondcData.bppUri,
      orderId: order.orderId,
      reasonId: reasonId || '001',
      reason: reason || 'Customer request'
    });

    order.status = 'CANCELLED';
    order.updatedAt = Date.now();
    await order.save();

    logger.info('Order cancelled', { userId: req.userId, orderId: order.orderId });

    res.json({
      message: 'Order cancelled successfully',
      order
    });
  } catch (error) {
    logger.error('Cancel order error:', error);
    res.status(500).json({ error: 'Failed to cancel order' });
  }
});

// Get support info for order
router.get('/:orderId/support', async (req, res) => {
  try {
    const order = await Order.findOne({
      orderId: req.params.orderId,
      userId: req.userId
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Call ONDC support API
    const supportResult = await ondcService.support({
      transactionId: order.transactionId,
      bppId: order.ondcData.bppId,
      bppUri: order.ondcData.bppUri,
      orderId: order.orderId
    });

    res.json({
      support: supportResult
    });
  } catch (error) {
    logger.error('Get support error:', error);
    res.status(500).json({ error: 'Failed to get support info' });
  }
});

module.exports = router;

