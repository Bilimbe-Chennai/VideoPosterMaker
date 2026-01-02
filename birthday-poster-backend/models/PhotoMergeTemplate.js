const mongoose = require('mongoose');

const PhotoMergeTemplateSchema = new mongoose.Schema({
    templatename: { type: String, required: true },
    templatePhotos: [{ type: mongoose.Schema.Types.ObjectId }],
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
