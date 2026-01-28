const mongoose = require('mongoose');

const TemplateGuideSchema = new mongoose.Schema({
  accessType: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  displayName: {
    type: String,
    default: ''
  },
  pdfId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  filename: {
    type: String,
    required: true
  },
  uploadedBy: {
    type: String, // adminid
    default: ''
  },
  uploadedAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('TemplateGuide', TemplateGuideSchema);
