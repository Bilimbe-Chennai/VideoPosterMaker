const express = require('express');
const router = express.Router();
const ActivityHistory = require('../models/ActivityHistory');

// GET activity history for a customer by phone number
router.get('/customer/:phone', async (req, res) => {
  try {
    const { phone } = req.params;
    const { adminid, limit = 50, page = 1 } = req.query;

    if (!phone) {
      return res.status(400).json({ error: 'Phone number is required' });
    }

    const query = { customerPhone: phone };
    if (adminid) {
      query.adminid = adminid;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const activities = await ActivityHistory.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip)
      .lean();

    const total = await ActivityHistory.countDocuments(query);

    res.json({
      success: true,
      data: activities,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (err) {
    console.error('Error fetching activity history:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET activity history for a customer by name (fallback)
router.get('/customer-by-name/:name', async (req, res) => {
  try {
    const { name } = req.params;
    const { adminid, limit = 50, page = 1 } = req.query;

    if (!name) {
      return res.status(400).json({ error: 'Customer name is required' });
    }

    const query = { customerName: new RegExp(name, 'i') };
    if (adminid) {
      query.adminid = adminid;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const activities = await ActivityHistory.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip)
      .lean();

    const total = await ActivityHistory.countDocuments(query);

    res.json({
      success: true,
      data: activities,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (err) {
    console.error('Error fetching activity history:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST create activity history entry
router.post('/', async (req, res) => {
  try {
    const {
      customerPhone,
      customerName,
      customerEmail,
      activityType,
      activityDescription,
      mediaId,
      templateName,
      branchName,
      adminid,
      metadata
    } = req.body;

    if (!customerPhone || !customerName || !activityType || !activityDescription || !adminid) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const activity = new ActivityHistory({
      customerPhone,
      customerName,
      customerEmail: customerEmail || '',
      activityType,
      activityDescription,
      mediaId: mediaId || null,
      templateName: templateName || '',
      branchName: branchName || '',
      adminid,
      metadata: metadata || {}
    });

    await activity.save();

    res.json({ success: true, data: activity });
  } catch (err) {
    console.error('Error creating activity history:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET all activities for an admin with filters
router.get('/admin/:adminid', async (req, res) => {
  try {
    const { adminid } = req.params;
    const { 
      customerPhone, 
      activityType, 
      startDate, 
      endDate, 
      limit = 50, 
      page = 1 
    } = req.query;

    const query = { adminid };

    if (customerPhone) {
      query.customerPhone = customerPhone;
    }

    if (activityType) {
      query.activityType = activityType;
    }

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const activities = await ActivityHistory.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip)
      .lean();

    const total = await ActivityHistory.countDocuments(query);

    res.json({
      success: true,
      data: activities,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (err) {
    console.error('Error fetching admin activity history:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
