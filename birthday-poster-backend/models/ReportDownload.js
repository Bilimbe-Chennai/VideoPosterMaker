const mongoose = require('mongoose');

const ReportDownloadSchema = new mongoose.Schema({
  adminid: {
    type: String,
    required: true,
    index: true
  },
  reportId: {
    type: String,
    required: true,
    enum: ['customer', 'photo', 'campaign', 'share'],
    index: true
  },
  reportType: {
    type: String,
    required: true,
    enum: ['csv', 'pdf']
  },
  downloadedAt: {
    type: Date,
    default: Date.now,
    index: true
  }
}, {
  timestamps: true
});

// Index for efficient queries
ReportDownloadSchema.index({ adminid: 1, downloadedAt: -1 });
ReportDownloadSchema.index({ reportId: 1, downloadedAt: -1 });
ReportDownloadSchema.index({ adminid: 1, reportId: 1 });

module.exports = mongoose.model('ReportDownload', ReportDownloadSchema);
