const mongoose = require('mongoose');

const invoiceSchema = new mongoose.Schema({
    companyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Company',
        required: true
    },
    subscriptionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Subscription'
    },
    invoiceNumber: {
        type: String,
        required: true,
        unique: true
    },
    amount: {
        type: Number,
        required: true
    },
    currency: {
        type: String,
        default: 'INR'
    },
    status: {
        type: String,
        enum: ['paid', 'unpaid', 'void'],
        default: 'paid'
    },
    date: {
        type: Date,
        default: Date.now
    },
    periodStart: Date,
    periodEnd: Date,
    pdfUrl: String
}, { timestamps: true });

module.exports = mongoose.model('Invoice', invoiceSchema);
