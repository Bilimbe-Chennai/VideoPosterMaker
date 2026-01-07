const mongoose = require('mongoose');

const CampaignSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  type: {
    type: String,
    enum: ['WhatsApp', 'Email', 'SMS', 'Push Notification'],
    required: true
  },
  status: {
    type: String,
    enum: ['Active', 'Scheduled', 'Completed', 'Failed', 'Draft'],
    default: 'Draft'
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  adminid: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  targetAudience: {
    source: {
      type: String,
      default: 'Photo Merge App'
    },
    template_name: {
      type: String,
      default: ''
    },
    customerIds: [{
      type: String
    }]
  },
  message: {
    type: String,
    default: ''
  },
  sent: {
    type: Number,
    default: 0
  },
  delivered: {
    type: Number,
    default: 0
  },
  clicks: {
    type: Number,
    default: 0
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

// Update updatedAt before saving
CampaignSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Campaign', CampaignSchema);

