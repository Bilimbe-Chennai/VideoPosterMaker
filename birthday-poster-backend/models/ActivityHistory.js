const mongoose = require('mongoose');

const ActivityHistorySchema = new mongoose.Schema({
  customerPhone: {
    type: String,
    required: true,
    index: true
  },
  customerName: {
    type: String,
    required: true
  },
  customerEmail: {
    type: String,
    default: ''
  },
  activityType: {
    type: String,
    enum: ['photo_created', 'photo_shared_whatsapp', 'photo_shared_facebook', 'photo_shared_twitter', 'photo_shared_instagram', 'photo_downloaded', 'message_sent', 'video_created', 'poster_created', 'url_clicked'],
    required: true
  },
  activityDescription: {
    type: String,
    required: true
  },
  mediaId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'medias',
    default: null
  },
  templateName: {
    type: String,
    default: ''
  },
  branchName: {
    type: String,
    default: ''
  },
  adminid: {
    type: String,
    required: true,
    index: true
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  }
}, {
  timestamps: true
});

// Index for efficient queries
ActivityHistorySchema.index({ customerPhone: 1, createdAt: -1 });
ActivityHistorySchema.index({ adminid: 1, createdAt: -1 });

module.exports = mongoose.model('ActivityHistory', ActivityHistorySchema);
