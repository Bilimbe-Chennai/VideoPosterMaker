const mongoose = require('mongoose');

const companySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    address: {
        line1: String,
        line2: String,
        city: String,
        state: String,
        pincode: String,
        country: { type: String, default: 'India' }
    },
    gstNumber: String,
    phone: String,
    logo: String,
    adminUser: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, { timestamps: true });

module.exports = mongoose.model('Company', companySchema);
