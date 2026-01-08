const Subscription = require('../models/Subscription');
const UsageTracking = require('../models/UsageTracking');
const PLANS = require('../constants/plans');

class SubscriptionService {
    async getSubscription(companyId) {
        return await Subscription.findOne({ companyId });
    }

    async getUsage(companyId) {
        const now = new Date();
        const monthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

        let usage = await UsageTracking.findOne({ companyId, month: monthStr });

        if (!usage) {
            const sub = await this.getSubscription(companyId);
            const planName = sub ? sub.plan.toUpperCase().replace('+', '_PLUS') : 'BASIC';
            const planLimits = PLANS[planName].limits;

            usage = await UsageTracking.create({
                companyId,
                month: monthStr,
                metrics: {
                    photos: { used: 0, limit: planLimits.photos },
                    shares: { used: 0, limit: planLimits.shares },
                    campaigns: { used: 0, limit: planLimits.campaigns }
                }
            });
        }

        return usage;
    }

    async incrementUsage(companyId, metric, amount = 1) {
        const usage = await this.getUsage(companyId);
        usage.metrics[metric].used += amount;
        return await usage.save();
    }
}

module.exports = new SubscriptionService();
