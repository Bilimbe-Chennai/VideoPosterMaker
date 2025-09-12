const mongoose = require('mongoose');

const AdminSettingsSchema = new mongoose.Schema({
  name: String,
  date: String,
  type: String,
  photoId: mongoose.Schema.Types.ObjectId,
  videoId: mongoose.Schema.Types.ObjectId,
  posterId: mongoose.Schema.Types.ObjectId,
  video1Id: mongoose.Schema.Types.ObjectId,
  video2Id: mongoose.Schema.Types.ObjectId,
  audioId: mongoose.Schema.Types.ObjectId,
  posterVideoId: mongoose.Schema.Types.ObjectId,
  mergedVideoId: mongoose.Schema.Types.ObjectId,
  //sampleVideoId:mongoose.Schema.Types.ObjectId,
  gifId: mongoose.Schema.Types.ObjectId,
  boyVideoId: mongoose.Schema.Types.ObjectId,
  girlVideoId: mongoose.Schema.Types.ObjectId,
  childBoyVideoId: mongoose.Schema.Types.ObjectId,
  childGirlVideoId: mongoose.Schema.Types.ObjectId,
  faceSwap: { type: Boolean, default: false },
  videosMergeOption: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});
module.exports = mongoose.model('AdminSettings', AdminSettingsSchema);