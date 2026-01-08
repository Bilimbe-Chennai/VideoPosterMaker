const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
    companyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Company',
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    method: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['success', 'failed', 'pending'],
        default: 'success'
    },
    transactionId: String,
    invoiceId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Invoice'
    }
}, { timestamps: true });

module.exports = mongoose.model('Payment', paymentSchema);
