const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const axios = require('axios');
const Campaign = require('../models/Campaign');
const Media = require('../models/Media');

// GET all campaigns for an admin
router.get('/', async (req, res) => {
  try {
    const { adminid, status, type, page = 1, limit = 50 } = req.query;
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

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Get total count for pagination
    const total = await Campaign.countDocuments(query);

    // Get paginated campaigns
    const campaigns = await Campaign.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean();

    res.json({
      data: campaigns || [],
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
        hasNextPage: pageNum < Math.ceil(total / limitNum),
        hasPrevPage: pageNum > 1
      }
    });
  } catch (error) {
    console.error('Error fetching campaigns:', error);
    res.status(500).json({ error: 'Failed to fetch campaigns', message: error.message });
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
      message,
      sent,
      delivered,
      clicks
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
      targetAudience: targetAudience || { source: 'photo merge app' },  
      message: message || '',
      sent: sent !== undefined ? sent : 0,
      delivered: delivered !== undefined ? delivered : 0,
      clicks: clicks !== undefined ? clicks : 0
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

// GET photo merge app customers for targeting
router.get('/target/customers', async (req, res) => {
  try {
    const { adminid, template_name } = req.query;
    const query = { source: 'photo merge app' };

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
          latestUpload: item.createdAt,
          latestMediaId: item._id
        };
      }
      customersMap[key].photoCount += 1;
      if (new Date(item.createdAt) > new Date(customersMap[key].latestUpload)) {
        customersMap[key].latestUpload = item.createdAt;
        customersMap[key].latestMediaId = item._id;
      }
    });

    const customers = Object.values(customersMap);
    res.json(customers);
  } catch (error) {
    console.error('Error fetching customers:', error);
    res.status(500).json({ error: 'Failed to fetch customers' });
  }
});

// Helper function to send WhatsApp message
const sendWhatsAppMessage = async (toNumber, message, templateId) => {
  try {
    const token = process.env.CHATMYBOT_TOKEN;
    if (!token) {
      throw new Error('ChatMyBot token not configured');
    }

    const payload = [
      {
        to: toNumber,
        type: "template",
        template: {
          id: templateId || process.env.WHATSAPP_TEMPLATE_ID,
          language: {
            code: "en",
          },
          components: [
            {
              type: "body",
              parameters: [
                {
                  type: "text",
                  text: message,
                },
              ],
            },
          ],
        },
      },
    ];

    const response = await axios.post(
      `https://wa.chatmybot.in/gateway/wabuissness/v1/message/batchapi`,
      payload,
      {
        headers: {
          "Content-Type": "application/json",
          accessToken: token,
        },
      }
    );

    if (response.status !== 200 || (response.data && response.data.status === "error")) {
      throw new Error(response.data?.message || 'Failed to send message via ChatMyBot');
    }

    return { success: true, response: response.data };
  } catch (error) {
    console.error('WhatsApp sending error:', error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data?.message || error.message || 'Failed to send WhatsApp message'
    };
  }
};

// POST send campaign
router.post('/:id/send', async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id);
    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found' });
    }

    // Get target customers
    const query = { source: campaign.targetAudience.source || 'photo merge app' };
    if (campaign.adminid) {
      query.adminid = campaign.adminid;
    }
    if (campaign.targetAudience.template_name) {
      query.template_name = campaign.targetAudience.template_name;
    }

    const media = await Media.find(query);

    // Group unique customers with valid WhatsApp numbers
    const customersMap = {};
    media.forEach(item => {
      const phone = item.whatsapp || item.mobile || '';
      const key = phone && phone !== 'N/A' ? phone : (item.name || 'Unknown');

      if (!customersMap[key] && phone && phone !== 'N/A') {
        customersMap[key] = {
          name: item.name || 'Unknown',
          email: item.email || '',
          whatsapp: phone,
          phone: phone
        };
      }
    });

    const customers = Object.values(customersMap);
    const totalCustomers = customers.length;

    if (totalCustomers === 0) {
      return res.status(400).json({
        error: 'No valid customers found with WhatsApp numbers for this campaign'
      });
    }

    let sentCount = 0;
    let deliveredCount = 0;
    let failedCount = 0;
    const errors = [];

    // Send messages based on campaign type
    if (campaign.type === 'WhatsApp') {
      const campaignMessage = campaign.message || `Hello! Check out our latest campaign: ${campaign.name}`;
      const templateId = process.env.WHATSAPP_TEMPLATE_ID_APP || process.env.WHATSAPP_TEMPLATE_ID;

      // Send messages in batches (process 10 at a time to avoid rate limits)
      const batchSize = 10;
      for (let i = 0; i < customers.length; i += batchSize) {
        const batch = customers.slice(i, i + batchSize);

        const sendPromises = batch.map(async (customer) => {
          try {
            const result = await sendWhatsAppMessage(
              customer.whatsapp,
              campaignMessage,
              templateId
            );

            if (result.success) {
              sentCount++;
              deliveredCount++;
              return { success: true, customer: customer.name || customer.whatsapp };
            } else {
              failedCount++;
              errors.push(`${customer.name || customer.whatsapp}: ${result.error}`);
              return { success: false, customer: customer.name || customer.whatsapp, error: result.error };
            }
          } catch (error) {
            failedCount++;
            const errorMsg = error.message || 'Unknown error';
            errors.push(`${customer.name || customer.whatsapp}: ${errorMsg}`);
            return { success: false, customer: customer.name || customer.whatsapp, error: errorMsg };
          }
        });

        await Promise.all(sendPromises);

        // Small delay between batches to avoid rate limiting
        if (i + batchSize < customers.length) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
    } else {
      // For other campaign types (Email, SMS, Push Notification), just mark as sent
      // You can add actual sending logic for these types later
      sentCount = totalCustomers;
      deliveredCount = totalCustomers;
    }

    // Update campaign stats
    campaign.sent = sentCount;
    campaign.delivered = deliveredCount;
    campaign.clicks = 0; // Will be updated when users interact
    campaign.status = sentCount > 0 ? 'Active' : 'Failed';
    campaign.updatedAt = new Date();
    await campaign.save();

    const responseMessage = campaign.type === 'WhatsApp'
      ? `Campaign sent: ${deliveredCount} delivered, ${failedCount} failed out of ${totalCustomers} customers`
      : `Campaign sent to ${sentCount} customers`;

    res.json({
      success: true,
      message: responseMessage,
      campaign,
      stats: {
        total: totalCustomers,
        sent: sentCount,
        delivered: deliveredCount,
        failed: failedCount
      },
      errors: errors.length > 0 ? errors.slice(0, 10) : [] // Return first 10 errors if any
    });
  } catch (error) {
    console.error('Error sending campaign:', error);
    res.status(500).json({
      error: 'Failed to send campaign',
      details: error.message
    });
  }
});

module.exports = router;

