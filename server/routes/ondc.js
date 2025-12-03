const express = require('express');
const Joi = require('joi');
const ondcService = require('../services/ondcService');
const authMiddleware = require('../middleware/auth');
const Cart = require('../models/Cart');
const logger = require('../utils/logger');

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// Validation schemas
const searchSchema = Joi.object({
  query: Joi.string().allow(''),
  category: Joi.string().allow(''),
  gps: Joi.string(),
  pincode: Joi.string()
});

// Search for products
router.post('/search', async (req, res) => {
  try {
    const { error } = searchSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const result = await ondcService.search(req.body);

    logger.info('Search request initiated', { 
      userId: req.userId,
      transactionId: result.transactionId 
    });

    res.json({
      message: 'Search request sent',
      transactionId: result.transactionId,
      messageId: result.messageId
    });
  } catch (error) {
    logger.error('Search error:', error);
    res.status(500).json({ error: 'Search request failed' });
  }
});

// Select items (get quote)
router.post('/select', async (req, res) => {
  try {
    const { transactionId, bppId, bppUri, providerId, items, gps, pincode } = req.body;

    if (!transactionId || !bppId || !bppUri || !providerId || !items) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const result = await ondcService.select({
      transactionId,
      bppId,
      bppUri,
      providerId,
      items,
      gps,
      pincode
    });

    logger.info('Select request initiated', { userId: req.userId, transactionId });

    res.json({
      message: 'Select request sent',
      result
    });
  } catch (error) {
    logger.error('Select error:', error);
    res.status(500).json({ error: 'Select request failed' });
  }
});

// Initialize order
router.post('/init', async (req, res) => {
  try {
    const {
      transactionId,
      bppId,
      bppUri,
      providerId,
      items,
      billing,
      email,
      phone,
      deliveryLocation
    } = req.body;

    if (!transactionId || !bppId || !bppUri || !providerId || !items || !billing || !deliveryLocation) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const result = await ondcService.init({
      transactionId,
      bppId,
      bppUri,
      providerId,
      items,
      billing,
      email,
      phone,
      deliveryLocation
    });

    logger.info('Init request initiated', { userId: req.userId, transactionId });

    res.json({
      message: 'Init request sent',
      result
    });
  } catch (error) {
    logger.error('Init error:', error);
    res.status(500).json({ error: 'Init request failed' });
  }
});

// Confirm order
router.post('/confirm', async (req, res) => {
  try {
    const {
      transactionId,
      bppId,
      bppUri,
      providerId,
      orderId,
      items,
      billing,
      fulfillments,
      payment,
      quote
    } = req.body;

    if (!transactionId || !bppId || !bppUri || !providerId || !orderId || !items || !billing || !fulfillments || !payment) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const result = await ondcService.confirm({
      transactionId,
      bppId,
      bppUri,
      providerId,
      orderId,
      items,
      billing,
      fulfillments,
      payment,
      quote
    });

    logger.info('Confirm request initiated', { 
      userId: req.userId, 
      transactionId,
      orderId 
    });

    res.json({
      message: 'Confirm request sent',
      result
    });
  } catch (error) {
    logger.error('Confirm error:', error);
    res.status(500).json({ error: 'Confirm request failed' });
  }
});

// Get order status
router.post('/status', async (req, res) => {
  try {
    const { transactionId, bppId, bppUri, orderId } = req.body;

    if (!transactionId || !bppId || !bppUri || !orderId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const result = await ondcService.status({
      transactionId,
      bppId,
      bppUri,
      orderId
    });

    logger.info('Status request initiated', { userId: req.userId, orderId });

    res.json({
      message: 'Status request sent',
      result
    });
  } catch (error) {
    logger.error('Status error:', error);
    res.status(500).json({ error: 'Status request failed' });
  }
});

// Track order
router.post('/track', async (req, res) => {
  try {
    const { transactionId, bppId, bppUri, orderId } = req.body;

    if (!transactionId || !bppId || !bppUri || !orderId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const result = await ondcService.track({
      transactionId,
      bppId,
      bppUri,
      orderId
    });

    logger.info('Track request initiated', { userId: req.userId, orderId });

    res.json({
      message: 'Track request sent',
      result
    });
  } catch (error) {
    logger.error('Track error:', error);
    res.status(500).json({ error: 'Track request failed' });
  }
});

// Cancel order
router.post('/cancel', async (req, res) => {
  try {
    const { transactionId, bppId, bppUri, orderId, reasonId, reason } = req.body;

    if (!transactionId || !bppId || !bppUri || !orderId || !reasonId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const result = await ondcService.cancel({
      transactionId,
      bppId,
      bppUri,
      orderId,
      reasonId,
      reason
    });

    logger.info('Cancel request initiated', { userId: req.userId, orderId });

    res.json({
      message: 'Cancel request sent',
      result
    });
  } catch (error) {
    logger.error('Cancel error:', error);
    res.status(500).json({ error: 'Cancel request failed' });
  }
});

// Get support info
router.post('/support', async (req, res) => {
  try {
    const { transactionId, bppId, bppUri, orderId } = req.body;

    if (!transactionId || !bppId || !bppUri || !orderId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const result = await ondcService.support({
      transactionId,
      bppId,
      bppUri,
      orderId
    });

    logger.info('Support request initiated', { userId: req.userId, orderId });

    res.json({
      message: 'Support request sent',
      result
    });
  } catch (error) {
    logger.error('Support error:', error);
    res.status(500).json({ error: 'Support request failed' });
  }
});

// Cart operations
// Get user cart
router.get('/cart', async (req, res) => {
  try {
    let cart = await Cart.findOne({ userId: req.userId });
    
    if (!cart) {
      cart = new Cart({ userId: req.userId, items: [] });
      await cart.save();
    }

    res.json({ cart });
  } catch (error) {
    logger.error('Get cart error:', error);
    res.status(500).json({ error: 'Failed to fetch cart' });
  }
});

// Add item to cart
router.post('/cart/add', async (req, res) => {
  try {
    const { providerId, providerName, bppId, bppUri, itemId, itemName, itemDescriptor, price, quantity, fulfillmentId, locationId } = req.body;

    let cart = await Cart.findOne({ userId: req.userId });
    
    if (!cart) {
      cart = new Cart({ userId: req.userId, items: [] });
    }

    // Check if item already exists in cart
    const existingItemIndex = cart.items.findIndex(
      item => item.itemId === itemId && item.providerId === providerId
    );

    if (existingItemIndex > -1) {
      // Update quantity
      cart.items[existingItemIndex].quantity += quantity || 1;
    } else {
      // Add new item
      cart.items.push({
        providerId,
        providerName,
        bppId,
        bppUri,
        itemId,
        itemName,
        itemDescriptor,
        price,
        quantity: quantity || 1,
        fulfillmentId,
        locationId
      });
    }

    cart.updatedAt = Date.now();
    await cart.save();

    logger.info('Item added to cart', { userId: req.userId, itemId });

    res.json({
      message: 'Item added to cart',
      cart
    });
  } catch (error) {
    logger.error('Add to cart error:', error);
    res.status(500).json({ error: 'Failed to add item to cart' });
  }
});

// Update cart item quantity
router.put('/cart/update/:itemId', async (req, res) => {
  try {
    const { quantity } = req.body;
    
    if (!quantity || quantity < 1) {
      return res.status(400).json({ error: 'Invalid quantity' });
    }

    const cart = await Cart.findOne({ userId: req.userId });
    
    if (!cart) {
      return res.status(404).json({ error: 'Cart not found' });
    }

    const item = cart.items.find(item => item.itemId === req.params.itemId);
    
    if (!item) {
      return res.status(404).json({ error: 'Item not found in cart' });
    }

    item.quantity = quantity;
    cart.updatedAt = Date.now();
    await cart.save();

    logger.info('Cart item updated', { userId: req.userId, itemId: req.params.itemId });

    res.json({
      message: 'Cart item updated',
      cart
    });
  } catch (error) {
    logger.error('Update cart error:', error);
    res.status(500).json({ error: 'Failed to update cart' });
  }
});

// Remove item from cart
router.delete('/cart/remove/:itemId', async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.userId });
    
    if (!cart) {
      return res.status(404).json({ error: 'Cart not found' });
    }

    cart.items = cart.items.filter(item => item.itemId !== req.params.itemId);
    cart.updatedAt = Date.now();
    await cart.save();

    logger.info('Item removed from cart', { userId: req.userId, itemId: req.params.itemId });

    res.json({
      message: 'Item removed from cart',
      cart
    });
  } catch (error) {
    logger.error('Remove from cart error:', error);
    res.status(500).json({ error: 'Failed to remove item from cart' });
  }
});

// Clear cart
router.delete('/cart/clear', async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.userId });
    
    if (!cart) {
      return res.status(404).json({ error: 'Cart not found' });
    }

    cart.items = [];
    cart.updatedAt = Date.now();
    await cart.save();

    logger.info('Cart cleared', { userId: req.userId });

    res.json({
      message: 'Cart cleared',
      cart
    });
  } catch (error) {
    logger.error('Clear cart error:', error);
    res.status(500).json({ error: 'Failed to clear cart' });
  }
});

module.exports = router;

