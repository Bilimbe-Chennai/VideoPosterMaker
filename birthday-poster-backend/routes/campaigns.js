const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Campaign = require('../models/Campaign');
const Media = require('../models/Media');

// GET all campaigns for an admin
router.get('/', async (req, res) => {
  try {
    const { adminid, status, type } = req.query;
    const query = {};
    
    if (adminid) {
      query.adminid = adminid;
    }
    if (status) {
      query.status = status;
    }
    if (type) {
      query.type = type;
    }

    const campaigns = await Campaign.find(query).sort({ createdAt: -1 });
    res.json(campaigns);
  } catch (error) {
    console.error('Error fetching campaigns:', error);
    res.status(500).json({ error: 'Failed to fetch campaigns' });
  }
});

// GET single campaign by ID
router.get('/:id', async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id);
    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found' });
    }
    res.json(campaign);
  } catch (error) {
    console.error('Error fetching campaign:', error);
    res.status(500).json({ error: 'Failed to fetch campaign' });
  }
});

// POST create new campaign
router.post('/', async (req, res) => {
  try {
    const {
      name,
      description,
      type,
      status,
      startDate,
      endDate,
      adminid,
      targetAudience,
      message
    } = req.body;

    if (!name || !type || !adminid) {
      return res.status(400).json({ error: 'Name, type, and adminid are required' });
    }

    const campaign = new Campaign({
      name,
      description: description || '',
      type,
      status: status || 'Draft',
      startDate: startDate ? new Date(startDate) : new Date(),
      endDate: endDate ? new Date(endDate) : new Date(),
      adminid,
      targetAudience: targetAudience || { source: 'Photo Merge App' },
      message: message || ''
    });

    await campaign.save();
    res.status(201).json(campaign);
  } catch (error) {
    console.error('Error creating campaign:', error);
    res.status(500).json({ error: 'Failed to create campaign' });
  }
});

// PUT update campaign
router.put('/:id', async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id);
    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found' });
    }

    const {
      name,
      description,
      type,
      status,
      startDate,
      endDate,
      targetAudience,
      message,
      sent,
      delivered,
      clicks
    } = req.body;

    if (name !== undefined) campaign.name = name;
    if (description !== undefined) campaign.description = description;
    if (type !== undefined) campaign.type = type;
    if (status !== undefined) campaign.status = status;
    if (startDate !== undefined) campaign.startDate = new Date(startDate);
    if (endDate !== undefined) campaign.endDate = new Date(endDate);
    if (targetAudience !== undefined) campaign.targetAudience = targetAudience;
    if (message !== undefined) campaign.message = message;
    if (sent !== undefined) campaign.sent = sent;
    if (delivered !== undefined) campaign.delivered = delivered;
    if (clicks !== undefined) campaign.clicks = clicks;

    campaign.updatedAt = new Date();
    await campaign.save();

    res.json(campaign);
  } catch (error) {
    console.error('Error updating campaign:', error);
    res.status(500).json({ error: 'Failed to update campaign' });
  }
});

// DELETE campaign
router.delete('/:id', async (req, res) => {
  try {
    const campaign = await Campaign.findByIdAndDelete(req.params.id);
    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found' });
    }
    res.json({ success: true, message: 'Campaign deleted successfully' });
  } catch (error) {
    console.error('Error deleting campaign:', error);
    res.status(500).json({ error: 'Failed to delete campaign' });
  }
});

// GET Photo Merge App customers for targeting
router.get('/target/customers', async (req, res) => {
  try {
    const { adminid, template_name } = req.query;
    const query = { source: 'Photo Merge App' };
    
    if (adminid) {
      query.adminid = adminid;
    }
    if (template_name) {
      query.template_name = template_name;
    }

    const media = await Media.find(query);
    
    // Group by customer (phone/name)
    const customersMap = {};
    media.forEach(item => {
      const phone = item.whatsapp || item.mobile || '';
      const key = phone && phone !== 'N/A' ? phone : (item.name || 'Unknown');
      
      if (!customersMap[key]) {
        customersMap[key] = {
          name: item.name || 'Unknown',
          email: item.email || '',
          whatsapp: phone,
          phone: phone,
          photoCount: 0,
          latestUpload: item.createdAt
        };
      }
      customersMap[key].photoCount += 1;
      if (new Date(item.createdAt) > new Date(customersMap[key].latestUpload)) {
        customersMap[key].latestUpload = item.createdAt;
      }
    });

    const customers = Object.values(customersMap);
    res.json(customers);
  } catch (error) {
    console.error('Error fetching customers:', error);
    res.status(500).json({ error: 'Failed to fetch customers' });
  }
});

// POST send campaign
router.post('/:id/send', async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id);
    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found' });
    }

    // Get target customers
    const query = { source: campaign.targetAudience.source || 'Photo Merge App' };
    if (campaign.adminid) {
      query.adminid = campaign.adminid;
    }
    if (campaign.targetAudience.template_name) {
      query.template_name = campaign.targetAudience.template_name;
    }

    const media = await Media.find(query);
    
    // Group unique customers
    const customersMap = {};
    media.forEach(item => {
      const phone = item.whatsapp || item.mobile || '';
      const key = phone && phone !== 'N/A' ? phone : (item.name || 'Unknown');
      
      if (!customersMap[key]) {
        customersMap[key] = {
          name: item.name || 'Unknown',
          email: item.email || '',
          whatsapp: phone,
          phone: phone
        };
      }
    });

    const customers = Object.values(customersMap);
    const totalSent = customers.length;
    
    // Update campaign stats
    campaign.sent = totalSent;
    campaign.delivered = totalSent; // Assume all delivered for now
    campaign.status = 'Active';
    campaign.updatedAt = new Date();
    await campaign.save();

    // Here you would integrate with WhatsApp/Email/SMS API to actually send
    // For now, we just update the campaign status

    res.json({
      success: true,
      message: `Campaign sent to ${totalSent} customers`,
      campaign,
      customers: customers.length
    });
  } catch (error) {
    console.error('Error sending campaign:', error);
    res.status(500).json({ error: 'Failed to send campaign' });
  }
});

module.exports = router;

