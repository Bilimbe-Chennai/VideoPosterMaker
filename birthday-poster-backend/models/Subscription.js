const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
    companyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Company',
        required: true,
        unique: true
    },
    plan: {
        type: String,
        enum: ['Basic', 'Pro', 'Pro+'],
        default: 'Basic'
    },
    status: {
        type: String,
        enum: ['active', 'past_due', 'canceled', 'trialing'],
        default: 'active'
    },
    billingCycle: {
        type: String,
        enum: ['monthly', 'yearly'],
        default: 'monthly'
    },
    startDate: {
        type: Date,
        default: Date.now
    },
    currentPeriodEnd: {
        type: Date,
        default: function () {
            const date = new Date();
            date.setMonth(date.getMonth() + 1);
            return date;
        }
    },
    cancelAtPeriodEnd: {
        type: Boolean,
        default: false
    },
    paymentMethod: {
        type: {
            type: String,
            enum: ['card', 'upi', 'net_banking'],
            default: 'card'
        },
        last4: String,
        brand: String
    }
}, { timestamps: true });

module.exports = mongoose.model('Subscription', subscriptionSchema);
