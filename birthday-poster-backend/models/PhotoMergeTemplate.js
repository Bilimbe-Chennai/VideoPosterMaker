const mongoose = require('mongoose');

const PhotoMergeTemplateSchema = new mongoose.Schema({
    templatename: { type: String, required: true },
    templatePhotos: [{ type: mongoose.Schema.Types.ObjectId }],
    // Video merge fields (for accessType: 'videomerge')
    video1Id: { type: mongoose.Schema.Types.ObjectId }, // Start video
    video2Id: { type: mongoose.Schema.Types.ObjectId },
    video3Id: { type: mongoose.Schema.Types.ObjectId }, // End video
    audioId: { type: mongoose.Schema.Types.ObjectId },
    mergedVideoId: { type: mongoose.Schema.Types.ObjectId },
    // Animation fields (for animation option)
    gifId: { type: mongoose.Schema.Types.ObjectId }, // Animation gif
    photoId: { type: mongoose.Schema.Types.ObjectId }, // Photo (treated as video when animation is enabled)
    hasAnimation: { type: Boolean, default: false }, // Flag to indicate if animation is enabled
    name: { type: String },
    date: { type: String },
    faceSwap: { type: String },
    videosMergeOption: { type: String },
    clientname: { type: String },
    brandname: { type: String },
    congratsOption: { type: String },
    video1TextOption: { type: String },
    video2TextOption: { type: String },
    video3TextOption: { type: String },
    overlayTextColor: { type: String, default: '#FFFFFF' },
    overlayFontFamily: { type: String, default: 'Arial' },
    approved: { type: String },
    updatedDate: { type: Date, default: Date.now },
    type: { type: String, default: 'template' },
    source: { type: String, default: 'photo merge app' },
    adminid: { type: String },
    branchid: { type: String },
    accessType: { type: String, default: 'photomerge' },
    status: { type: String, default: 'active' },
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('photomergetemplates', PhotoMergeTemplateSchema);
