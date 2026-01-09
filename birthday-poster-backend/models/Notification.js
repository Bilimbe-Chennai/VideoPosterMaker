const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  adminid: {
    type: String,
    required: true,
    index: true
  },
  notificationId: {
    type: String,
    required: true,
    index: true
  },
  type: {
    type: String,
    enum: ['success', 'error', 'warning', 'info'],
    default: 'info'
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['templates', 'photos', 'campaigns', 'system'],
    default: 'system'
  },
  isUpdate: {
    type: Boolean,
    default: false
  },
  isRead: {
    type: Boolean,
    default: false,
    index: true
  },
  isDeleted: {
    type: Boolean,
    default: false,
    index: true
  },
  timestamp: {
    type: Number,
    required: true,
    index: true
  },
  date: {
    type: Date,
    required: true
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true
});

// Compound index for efficient queries
NotificationSchema.index({ adminid: 1, isDeleted: 1, timestamp: -1 });
NotificationSchema.index({ adminid: 1, isRead: 1, isDeleted: 1 });

module.exports = mongoose.model('Notification', NotificationSchema);
