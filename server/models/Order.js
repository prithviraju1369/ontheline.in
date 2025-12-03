const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  orderId: {
    type: String,
    required: true,
    unique: true
  },
  transactionId: {
    type: String,
    required: true
  },
  messageId: {
    type: String,
    required: true
  },
  // ONDC Provider details
  provider: {
    id: String,
    descriptor: {
      name: String,
      images: [String]
    }
  },
  // Order items
  items: [{
    id: String,
    name: String,
    quantity: Number,
    price: Number,
    descriptor: {
      name: String,
      images: [String]
    },
    fulfillmentId: String
  }],
  // Billing details
  billing: {
    name: String,
    email: String,
    phone: String,
    address: {
      door: String,
      name: String,
      building: String,
      street: String,
      locality: String,
      city: String,
      state: String,
      country: String,
      areaCode: String
    }
  },
  // Fulfillment details
  fulfillment: {
    id: String,
    type: String,
    tracking: Boolean,
    end: {
      contact: {
        email: String,
        phone: String
      },
      location: {
        gps: String,
        address: {
          door: String,
          name: String,
          building: String,
          street: String,
          locality: String,
          city: String,
          state: String,
          country: String,
          areaCode: String
        }
      }
    },
    state: {
      descriptor: {
        code: String,
        name: String
      }
    }
  },
  // Payment details
  payment: {
    type: String, // ON-ORDER, PRE-FULFILLMENT, POST-FULFILLMENT
    status: String, // PAID, NOT-PAID
    transactionId: String,
    amount: Number,
    currency: String
  },
  // Quote details
  quote: {
    price: {
      currency: String,
      value: String
    },
    breakup: [{
      title: String,
      price: {
        currency: String,
        value: String
      }
    }]
  },
  // Order status
  status: {
    type: String,
    enum: ['CREATED', 'ACCEPTED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'],
    default: 'CREATED'
  },
  // ONDC specific data
  ondcData: {
    bppId: String,
    bppUri: String,
    context: mongoose.Schema.Types.Mixed
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

orderSchema.index({ userId: 1, createdAt: -1 });
orderSchema.index({ orderId: 1 });
orderSchema.index({ transactionId: 1 });

module.exports = mongoose.model('Order', orderSchema);

