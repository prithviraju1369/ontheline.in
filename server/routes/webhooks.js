const express = require('express');
const Order = require('../models/Order');
const logger = require('../utils/logger');

const router = express.Router();

// ONDC callback handlers
// These endpoints receive callbacks from ONDC network

// on_search callback
router.post('/on_search', async (req, res) => {
  try {
    const { context, message } = req.body;
    
    logger.info('Received on_search callback', { 
      transactionId: context.transaction_id,
      messageId: context.message_id 
    });

    // Store search results (implement caching/storage as needed)
    // This is where you would process and store catalog items

    res.json({ message: { ack: { status: 'ACK' } } });
  } catch (error) {
    logger.error('on_search callback error:', error);
    res.status(500).json({ message: { ack: { status: 'NACK' } } });
  }
});

// on_select callback
router.post('/on_select', async (req, res) => {
  try {
    const { context, message } = req.body;
    
    logger.info('Received on_select callback', { 
      transactionId: context.transaction_id,
      messageId: context.message_id 
    });

    // Process quote information
    // Store or cache the quote for the user

    res.json({ message: { ack: { status: 'ACK' } } });
  } catch (error) {
    logger.error('on_select callback error:', error);
    res.status(500).json({ message: { ack: { status: 'NACK' } } });
  }
});

// on_init callback
router.post('/on_init', async (req, res) => {
  try {
    const { context, message } = req.body;
    
    logger.info('Received on_init callback', { 
      transactionId: context.transaction_id,
      messageId: context.message_id 
    });

    // Process payment and fulfillment details
    // Update order with payment terms

    res.json({ message: { ack: { status: 'ACK' } } });
  } catch (error) {
    logger.error('on_init callback error:', error);
    res.status(500).json({ message: { ack: { status: 'NACK' } } });
  }
});

// on_confirm callback
router.post('/on_confirm', async (req, res) => {
  try {
    const { context, message } = req.body;
    
    logger.info('Received on_confirm callback', { 
      transactionId: context.transaction_id,
      orderId: message.order?.id 
    });

    // Update order status to ACCEPTED
    if (message.order?.id) {
      const order = await Order.findOne({ orderId: message.order.id });
      if (order) {
        order.status = 'ACCEPTED';
        order.ondcData.context = context;
        order.updatedAt = Date.now();
        
        // Update fulfillment details
        if (message.order.fulfillments) {
          order.fulfillment = message.order.fulfillments[0];
        }
        
        await order.save();
        logger.info('Order confirmed and updated', { orderId: order.orderId });
      }
    }

    res.json({ message: { ack: { status: 'ACK' } } });
  } catch (error) {
    logger.error('on_confirm callback error:', error);
    res.status(500).json({ message: { ack: { status: 'NACK' } } });
  }
});

// on_status callback
router.post('/on_status', async (req, res) => {
  try {
    const { context, message } = req.body;
    
    logger.info('Received on_status callback', { 
      transactionId: context.transaction_id,
      orderId: message.order?.id 
    });

    // Update order status based on fulfillment state
    if (message.order?.id) {
      const order = await Order.findOne({ orderId: message.order.id });
      if (order) {
        const fulfillmentState = message.order.fulfillments?.[0]?.state?.descriptor?.code;
        
        // Map ONDC fulfillment states to our order status
        const statusMap = {
          'Pending': 'CREATED',
          'Packed': 'IN_PROGRESS',
          'Agent-assigned': 'IN_PROGRESS',
          'Out-for-delivery': 'IN_PROGRESS',
          'Order-delivered': 'COMPLETED',
          'Cancelled': 'CANCELLED'
        };

        if (fulfillmentState && statusMap[fulfillmentState]) {
          order.status = statusMap[fulfillmentState];
          order.fulfillment = message.order.fulfillments[0];
          order.updatedAt = Date.now();
          await order.save();
          
          logger.info('Order status updated', { 
            orderId: order.orderId,
            status: order.status,
            fulfillmentState 
          });
        }
      }
    }

    res.json({ message: { ack: { status: 'ACK' } } });
  } catch (error) {
    logger.error('on_status callback error:', error);
    res.status(500).json({ message: { ack: { status: 'NACK' } } });
  }
});

// on_track callback
router.post('/on_track', async (req, res) => {
  try {
    const { context, message } = req.body;
    
    logger.info('Received on_track callback', { 
      transactionId: context.transaction_id 
    });

    // Process tracking information
    // Return tracking URL or live location data

    res.json({ message: { ack: { status: 'ACK' } } });
  } catch (error) {
    logger.error('on_track callback error:', error);
    res.status(500).json({ message: { ack: { status: 'NACK' } } });
  }
});

// on_cancel callback
router.post('/on_cancel', async (req, res) => {
  try {
    const { context, message } = req.body;
    
    logger.info('Received on_cancel callback', { 
      transactionId: context.transaction_id,
      orderId: message.order?.id 
    });

    // Update order status to CANCELLED
    if (message.order?.id) {
      const order = await Order.findOne({ orderId: message.order.id });
      if (order) {
        order.status = 'CANCELLED';
        order.updatedAt = Date.now();
        await order.save();
        
        logger.info('Order cancellation confirmed', { orderId: order.orderId });
      }
    }

    res.json({ message: { ack: { status: 'ACK' } } });
  } catch (error) {
    logger.error('on_cancel callback error:', error);
    res.status(500).json({ message: { ack: { status: 'NACK' } } });
  }
});

// on_update callback
router.post('/on_update', async (req, res) => {
  try {
    const { context, message } = req.body;
    
    logger.info('Received on_update callback', { 
      transactionId: context.transaction_id,
      orderId: message.order?.id 
    });

    // Handle order updates
    if (message.order?.id) {
      const order = await Order.findOne({ orderId: message.order.id });
      if (order) {
        // Update relevant fields
        if (message.order.fulfillments) {
          order.fulfillment = message.order.fulfillments[0];
        }
        if (message.order.quote) {
          order.quote = message.order.quote;
        }
        order.updatedAt = Date.now();
        await order.save();
        
        logger.info('Order updated', { orderId: order.orderId });
      }
    }

    res.json({ message: { ack: { status: 'ACK' } } });
  } catch (error) {
    logger.error('on_update callback error:', error);
    res.status(500).json({ message: { ack: { status: 'NACK' } } });
  }
});

// on_support callback
router.post('/on_support', async (req, res) => {
  try {
    const { context, message } = req.body;
    
    logger.info('Received on_support callback', { 
      transactionId: context.transaction_id 
    });

    // Process support contact information
    // Store or return to user

    res.json({ message: { ack: { status: 'ACK' } } });
  } catch (error) {
    logger.error('on_support callback error:', error);
    res.status(500).json({ message: { ack: { status: 'NACK' } } });
  }
});

module.exports = router;

