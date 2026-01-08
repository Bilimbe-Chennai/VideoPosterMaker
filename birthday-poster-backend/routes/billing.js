const express = require('express');
const router = express.Router();
const Invoice = require('../models/Invoice');

router.get('/invoices', async (req, res) => {
    try {
        const invoices = await Invoice.find({}).sort({ date: -1 });
        if (invoices.length > 0) {
            res.json(invoices);
        } else {
            // Mock data for UI restoration
            res.json([
                {
                    id: 'INV-2023-001',
                    date: '2023-12-01',
                    amount: 2499,
                    status: 'paid',
                    periodStart: '2023-12-01',
                    periodEnd: '2024-01-01',
                    pdfUrl: '#'
                },
                {
                    id: 'INV-2023-002',
                    date: '2023-11-01',
                    amount: 2499,
                    status: 'paid',
                    periodStart: '2023-11-01',
                    periodEnd: '2023-12-01',
                    pdfUrl: '#'
                }
            ]);
        }
    } catch (error) {
        res.status(500).json({ message: 'Error fetching invoices' });
    }
});

router.get('/address', async (req, res) => {
    res.json({
        companyName: 'Varamahalakshmi Silks',
        address: '123 Royal Silk Lane, Kanchipuram, Tamil Nadu 631501',
        gstin: '33AAAAA0000A1Z5',
        plan: 'Pro Plan (Monthly)',
        planEndDate: 'Jan 01, 2024'
    });
});

module.exports = router;
