const mongoose = require('mongoose');

const MediaSchema = new mongoose.Schema({
  _id:mongoose.Schema.Types.ObjectId,
  name: String,
  date: String,
  type: String,
  photoId: mongoose.Schema.Types.ObjectId,
  videoId: mongoose.Schema.Types.ObjectId,
  posterId: mongoose.Schema.Types.ObjectId,
  video1Id: mongoose.Schema.Types.ObjectId,
  video2Id: mongoose.Schema.Types.ObjectId,
  posterVideoId: mongoose.Schema.Types.ObjectId,
  mergedVideoId: mongoose.Schema.Types.ObjectId,
  gifId: mongoose.Schema.Types.ObjectId,
  audioId: mongoose.Schema.Types.ObjectId,
  whatsappstatus:String,
   qrCode: { type: String },
});

module.exports = mongoose.model('medias', MediaSchema);
