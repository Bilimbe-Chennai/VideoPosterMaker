const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');

// GET all notifications for an admin
router.get('/', async (req, res) => {
  try {
    const { adminid } = req.query;

    if (!adminid) {
      return res.status(400).json({ success: false, message: 'Admin ID is required.' });
    }

    const notifications = await Notification.find({
      adminid,
      isDeleted: false
    })
      .sort({ timestamp: -1 })
      .lean();

    res.json({ success: true, data: notifications || [] });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch notifications.', error: error.message });
  }
});

// POST: Mark notification as read
router.post('/:id/read', async (req, res) => {
  try {
    const { id } = req.params;
    const { adminid } = req.body;

    if (!adminid) {
      return res.status(400).json({ success: false, message: 'Admin ID is required.' });
    }

    const notification = await Notification.findOneAndUpdate(
      { notificationId: id, adminid, isDeleted: false },
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found.' });
    }

    res.json({ success: true, message: 'Notification marked as read.', data: notification });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ success: false, message: 'Failed to mark notification as read.', error: error.message });
  }
});

// POST: Mark all notifications as read
router.post('/mark-all-read', async (req, res) => {
  try {
    const { adminid } = req.body;

    if (!adminid) {
      return res.status(400).json({ success: false, message: 'Admin ID is required.' });
    }

    const result = await Notification.updateMany(
      { adminid, isRead: false, isDeleted: false },
      { isRead: true }
    );

    res.json({
      success: true,
      message: 'All notifications marked as read.',
      count: result.modifiedCount
    });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({ success: false, message: 'Failed to mark all notifications as read.', error: error.message });
  }
});

// DELETE: Delete a notification (soft delete)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { adminid } = req.query;

    if (!adminid) {
      return res.status(400).json({ success: false, message: 'Admin ID is required.' });
    }

    const notification = await Notification.findOneAndUpdate(
      { notificationId: id, adminid },
      { isDeleted: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found.' });
    }

    res.json({ success: true, message: 'Notification deleted successfully.' });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({ success: false, message: 'Failed to delete notification.', error: error.message });
  }
});

const { getAdminSettings } = require('../utils/settingsUtils');

// POST: Create or update notification
router.post('/', async (req, res) => {
  try {
    const { adminid, notificationId, type, title, message, category, isUpdate, timestamp, date, metadata } = req.body;

    if (!adminid || !notificationId || !title || !message) {
      return res.status(400).json({ success: false, message: 'Admin ID, notification ID, title, and message are required.' });
    }

    // Check Settings Before Saving/Sending
    const settings = await getAdminSettings(adminid);
    const notificationsSettings = settings.notifications;

    // Mapping category 'system', 'campaign', 'export' etc to settings keys
    // onPhoto, onShare, onCampaign, onReport, onBackup
    let shouldNotify = true;

    // Very simple mapping for now
    if (category === 'campaign' && !notificationsSettings.onCampaign) shouldNotify = false;
    if (category === 'photo' && !notificationsSettings.onPhoto) shouldNotify = false;
    if (category === 'share' && !notificationsSettings.onShare) shouldNotify = false;
    if (category === 'report' && !notificationsSettings.onReport) shouldNotify = false;
    if (category === 'backup' && !notificationsSettings.onBackup) shouldNotify = false;

    if (!shouldNotify) {
      return res.json({ success: true, message: 'Notification skipped by user settings.', skipped: true });
    }

    // Check if notification already exists
    let notification = await Notification.findOne({ adminid, notificationId });

    if (notification) {
      // Update existing notification if timestamp is newer
      if (timestamp && timestamp > notification.timestamp) {
        notification = await Notification.findOneAndUpdate(
          { adminid, notificationId },
          {
            type: type || notification.type,
            title,
            message,
            category: category || notification.category,
            isUpdate: isUpdate !== undefined ? isUpdate : notification.isUpdate,
            timestamp,
            date: date ? new Date(date) : notification.date,
            metadata: metadata || notification.metadata,
            isDeleted: false // Restore if it was deleted
          },
          { new: true }
        );
      }
    } else {
      // Create new notification
      notification = new Notification({
        adminid,
        notificationId,
        type: type || 'info',
        title,
        message,
        category: category || 'system',
        isUpdate: isUpdate || false,
        timestamp: timestamp || Date.now(),
        date: date ? new Date(date) : new Date(),
        metadata: metadata || {},
        isRead: false,
        isDeleted: false
      });
      await notification.save();
    }

    res.json({ success: true, message: 'Notification saved successfully.', data: notification });
  } catch (error) {
    console.error('Error saving notification:', error);
    res.status(500).json({ success: false, message: 'Failed to save notification.', error: error.message });
  }
});

// POST: Sync notifications (create/update from templates and photos)
router.post('/sync', async (req, res) => {
  try {
    const { adminid } = req.body;

    if (!adminid) {
      return res.status(400).json({ success: false, message: 'Admin ID is required.' });
    }

    // This endpoint can be called to sync notifications from templates and photos
    // The frontend will call this after fetching templates/photos
    res.json({ success: true, message: 'Sync endpoint ready. Use POST / to create notifications.' });
  } catch (error) {
    console.error('Error syncing notifications:', error);
    res.status(500).json({ success: false, message: 'Failed to sync notifications.', error: error.message });
  }
});

module.exports = router;
