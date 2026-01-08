const mongoose = require('mongoose');

const usageTrackingSchema = new mongoose.Schema({
    companyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Company',
        required: true
    },
    month: {
        type: String, // YYYY-MM
        required: true
    },
    metrics: {
        photos: {
            used: { type: Number, default: 0 },
            limit: { type: Number, default: 3000 }
        },
        shares: {
            used: { type: Number, default: 0 },
            limit: { type: Number, default: 2000 }
        },
        campaigns: {
            used: { type: Number, default: 0 },
            limit: { type: Number, default: 0 }
        }
    }
}, { timestamps: true });

// Ensure unique index for company/month combination
usageTrackingSchema.index({ companyId: 1, month: 1 }, { unique: true });

module.exports = mongoose.model('UsageTracking', usageTrackingSchema);
