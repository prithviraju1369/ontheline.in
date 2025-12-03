const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [{
    providerId: String,
    providerName: String,
    bppId: String,
    bppUri: String,
    itemId: String,
    itemName: String,
    itemDescriptor: {
      name: String,
      images: [String],
      shortDesc: String,
      longDesc: String
    },
    price: {
      currency: String,
      value: Number
    },
    quantity: {
      type: Number,
      default: 1,
      min: 1
    },
    fulfillmentId: String,
    locationId: String,
    addedAt: {
      type: Date,
      default: Date.now
    }
  }],
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

cartSchema.index({ userId: 1 });

module.exports = mongoose.model('Cart', cartSchema);

