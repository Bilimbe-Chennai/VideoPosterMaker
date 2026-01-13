const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    branchName: {
        type: String,
        default: ""
    },
    type: {
        type: String,
        enum: ['admin', 'sub-admin', 'client', 'app user', 'superadmin'],
        default: 'client'
    },
    loginCount: {
        type: Number,
        default: 0
    },
    lastLogin: {
        type: Date,
        default: null
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    companyName: {
        type: String,
        default: ""
    },
    phone: {
        type: String,
        default: ""
    },
    password: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'active'
    },
    accessType: {
        type: [String],
        default: []
    },
    templateCount: {
        type: Number,
        default: 3
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('User', UserSchema);
