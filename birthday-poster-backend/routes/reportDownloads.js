const express = require('express');
const router = express.Router();
const ReportDownload = require('../models/ReportDownload');

// POST - Track a report download
router.post('/', async (req, res) => {
  try {
    const { adminid, reportId, reportType } = req.body;

    if (!adminid || !reportId || !reportType) {
      return res.status(400).json({ error: 'adminid, reportId, and reportType are required' });
    }

    if (!['customer', 'photo', 'campaign', 'share'].includes(reportId)) {
      return res.status(400).json({ error: 'Invalid reportId' });
    }

    if (!['csv', 'pdf'].includes(reportType)) {
      return res.status(400).json({ error: 'Invalid reportType' });
    }

    const download = new ReportDownload({
      adminid,
      reportId,
      reportType,
      downloadedAt: new Date()
    });

    await download.save();
    res.status(201).json({ success: true, download });
  } catch (error) {
    console.error('Error tracking report download:', error);
    res.status(500).json({ error: 'Failed to track report download', message: error.message });
  }
});

// GET - Get download counts for all reports
router.get('/counts', async (req, res) => {
  try {
    const { adminid } = req.query;

    if (!adminid) {
      return res.status(400).json({ error: 'adminid is required' });
    }

    const counts = await ReportDownload.aggregate([
      { $match: { adminid } },
      {
        $group: {
          _id: '$reportId',
          count: { $sum: 1 }
        }
      }
    ]);

    const countsMap = {};
    counts.forEach(item => {
      countsMap[item._id] = item.count;
    });

    res.json({
      success: true,
      counts: {
        customer: countsMap['customer'] || 0,
        photo: countsMap['photo'] || 0,
        campaign: countsMap['campaign'] || 0,
        share: countsMap['share'] || 0
      }
    });
  } catch (error) {
    console.error('Error fetching download counts:', error);
    res.status(500).json({ error: 'Failed to fetch download counts', message: error.message });
  }
});

// GET - Get download history with filters
router.get('/history', async (req, res) => {
  try {
    const { adminid, reportId, startDate, endDate, limit = 1000 } = req.query;

    if (!adminid) {
      return res.status(400).json({ error: 'adminid is required' });
    }

    const query = { adminid };
    if (reportId) {
      query.reportId = reportId;
    }
    if (startDate || endDate) {
      query.downloadedAt = {};
      if (startDate) query.downloadedAt.$gte = new Date(startDate);
      if (endDate) query.downloadedAt.$lte = new Date(endDate);
    }

    const downloads = await ReportDownload.find(query)
      .sort({ downloadedAt: -1 })
      .limit(parseInt(limit))
      .lean();

    res.json({
      success: true,
      data: downloads
    });
  } catch (error) {
    console.error('Error fetching download history:', error);
    res.status(500).json({ error: 'Failed to fetch download history', message: error.message });
  }
});

// GET - Get downloads this month count
router.get('/this-month', async (req, res) => {
  try {
    const { adminid } = req.query;

    if (!adminid) {
      return res.status(400).json({ error: 'adminid is required' });
    }

    const currentMonth = new Date();
    currentMonth.setDate(1);
    currentMonth.setHours(0, 0, 0, 0);

    const count = await ReportDownload.countDocuments({
      adminid,
      downloadedAt: { $gte: currentMonth }
    });

    res.json({
      success: true,
      count
    });
  } catch (error) {
    console.error('Error fetching this month downloads:', error);
    res.status(500).json({ error: 'Failed to fetch this month downloads', message: error.message });
  }
});

// GET - Get previous month downloads count
router.get('/previous-month', async (req, res) => {
  try {
    const { adminid } = req.query;

    if (!adminid) {
      return res.status(400).json({ error: 'adminid is required' });
    }

    const currentMonth = new Date();
    currentMonth.setDate(1);
    currentMonth.setHours(0, 0, 0, 0);

    const previousMonth = new Date(currentMonth);
    previousMonth.setMonth(previousMonth.getMonth() - 1);

    const count = await ReportDownload.countDocuments({
      adminid,
      downloadedAt: { $gte: previousMonth, $lt: currentMonth }
    });

    res.json({
      success: true,
      count
    });
  } catch (error) {
    console.error('Error fetching previous month downloads:', error);
    res.status(500).json({ error: 'Failed to fetch previous month downloads', message: error.message });
  }
});

module.exports = router;
