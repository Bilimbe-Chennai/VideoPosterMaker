const Campaign = require('../models/Campaign');
const Media = require('../models/Media');
const axios = require('axios');

// Helper function to send WhatsApp message (same as in campaigns.js)
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

// Function to automatically send a scheduled campaign
const sendScheduledCampaign = async (campaign) => {
  try {
    console.log(`[Campaign Scheduler] Processing scheduled campaign: ${campaign.name} (ID: ${campaign._id})`);

    // Get target customers
    const query = { source: campaign.targetAudience?.source || 'Photo Merge App' };
    if (campaign.adminid) {
      query.adminid = campaign.adminid;
    }
    if (campaign.targetAudience?.template_name) {
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
      console.log(`[Campaign Scheduler] No valid customers found for campaign: ${campaign.name}`);
      campaign.status = 'Failed';
      campaign.updatedAt = new Date();
      await campaign.save();
      return { success: false, message: 'No valid customers found' };
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

    console.log(`[Campaign Scheduler] Campaign "${campaign.name}" sent: ${deliveredCount} delivered, ${failedCount} failed out of ${totalCustomers} customers`);

    return {
      success: sentCount > 0,
      message: `Campaign sent: ${deliveredCount} delivered, ${failedCount} failed out of ${totalCustomers} customers`,
      stats: {
        total: totalCustomers,
        sent: sentCount,
        delivered: deliveredCount,
        failed: failedCount
      }
    };
  } catch (error) {
    console.error(`[Campaign Scheduler] Error sending campaign ${campaign._id}:`, error);
    
    // Mark campaign as failed
    campaign.status = 'Failed';
    campaign.updatedAt = new Date();
    await campaign.save().catch(err => console.error('Error updating campaign status:', err));
    
    return { success: false, error: error.message };
  }
};

// Main scheduler function that checks for scheduled campaigns
const checkAndActivateScheduledCampaigns = async () => {
  try {
    const now = new Date();
    
    // Find campaigns that are scheduled and should be activated
    const scheduledCampaigns = await Campaign.find({
      status: 'Scheduled',
      startDate: { $lte: now } // startDate is less than or equal to now
    });

    if (scheduledCampaigns.length === 0) {
      return; // No campaigns to activate
    }

    console.log(`[Campaign Scheduler] Found ${scheduledCampaigns.length} scheduled campaign(s) to activate`);

    // Process each scheduled campaign
    for (const campaign of scheduledCampaigns) {
      try {
        await sendScheduledCampaign(campaign);
      } catch (error) {
        console.error(`[Campaign Scheduler] Error processing campaign ${campaign._id}:`, error);
      }
    }
  } catch (error) {
    console.error('[Campaign Scheduler] Error checking scheduled campaigns:', error);
  }
};

// Start the scheduler
const startCampaignScheduler = () => {
  console.log('[Campaign Scheduler] Starting campaign scheduler...');
  
  // Check immediately on startup
  checkAndActivateScheduledCampaigns();
  
  // Then check every minute (60000 ms)
  const interval = setInterval(() => {
    checkAndActivateScheduledCampaigns();
  }, 60000); // Check every 1 minute

  console.log('[Campaign Scheduler] Campaign scheduler started. Checking every 1 minute for scheduled campaigns.');
  
  return interval;
};

module.exports = {
  startCampaignScheduler,
  checkAndActivateScheduledCampaigns,
  sendScheduledCampaign
};
