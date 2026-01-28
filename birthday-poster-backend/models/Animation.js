const mongoose = require('mongoose');

const AnimationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  gifId: { type: mongoose.Schema.Types.ObjectId, required: true },
  filename: { type: String },
  uploadedBy: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Animation', AnimationSchema);
