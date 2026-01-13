const PremiumAdminSettings = require('../models/PremiumAdminSettings');

// Default Settings (Copy of what is in user.js routes, centralized here would be better but keeping simple for now)
const DEFAULT_PREMIUM_SETTINGS = {
    general: {
        adminName: '',
        companyName: '',
        email: '',
        phone: '',
        dateFormat: 'YYYY-MM-DD',
        exportFormat: 'Excel'
    },
    notifications: {
        email: true,
        whatsapp: true,
        push: false,
        onPhoto: true,
        onShare: true,
        onCampaign: true,
        onReport: false,
        onBackup: true
    },
    integrations: {
        whatsapp: { active: false, provider: '', apiKey: '', senderID: '' },
        email: { active: false, provider: '', apiKey: '', senderID: '' },
        sms: { active: false, provider: '', apiKey: '', senderID: '' }
    },
    // ... other defaults can be inferred or are less critical for backend logic
};

/**
 * Fetches admin settings and merges with defaults.
 * @param {string} adminid - The ID of the admin user.
 * @returns {Promise<Object>} - Merged settings object.
 */
const getAdminSettings = async (adminid) => {
    if (!adminid) return DEFAULT_PREMIUM_SETTINGS;

    try {
        const doc = await PremiumAdminSettings.findOne({ adminid }).lean();
        const savedSettings = doc?.settings || {};

        // Deep merge helper
        const merge = (target, source) => {
            for (const key in source) {
                if (source[key] instanceof Object && key in target) {
                    Object.assign(source[key], merge(target[key], source[key]));
                }
            }
            Object.assign(target || {}, source);
            return target;
        };

        // Simple merge for now, focusing on keys we need (Notifications, Integrations)
        return {
            general: { ...DEFAULT_PREMIUM_SETTINGS.general, ...savedSettings.general },
            notifications: { ...DEFAULT_PREMIUM_SETTINGS.notifications, ...savedSettings.notifications },
            integrations: {
                whatsapp: { ...DEFAULT_PREMIUM_SETTINGS.integrations.whatsapp, ...(savedSettings.integrations?.whatsapp || {}) },
                email: { ...DEFAULT_PREMIUM_SETTINGS.integrations.email, ...(savedSettings.integrations?.email || {}) },
                sms: { ...DEFAULT_PREMIUM_SETTINGS.integrations.sms, ...(savedSettings.integrations?.sms || {}) }
            }
        };
    } catch (error) {
        console.error(`Error fetching settings for admin ${adminid}:`, error);
        return DEFAULT_PREMIUM_SETTINGS;
    }
};

module.exports = { getAdminSettings };
