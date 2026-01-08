const express = require('express');
const router = express.Router();
const subscriptionService = require('../services/subscriptionService');

// Mock data for initial UI restoration
router.get('/status', async (req, res) => {
    try {
        const usage = await subscriptionService.getUsage('mock_company_id');
        res.json({
            currentPlan: 'Pro',
            usage: usage.metrics
        });
    } catch (error) {
        // If DB fails, return mock data to prevent UI break
        res.json({
            currentPlan: 'Pro',
            usage: {
                photos: { used: 8430, limit: 10000 },
                campaigns: { used: 3, limit: 5 },
                shares: { used: 7050, limit: 8000 }
            }
        });
    }
});

module.exports = router;
