const express = require('express');
const router = express.Router();
const User = require('../models/User');
const PremiumAdminSettings = require('../models/PremiumAdminSettings');

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
    export: {
        autoDaily: false,
        modules: ['Customers', 'Photos', 'Shares'],
        frequency: 'Weekly',
        destination: 'Download'
    },
    backup: {
        enabled: false,
        frequency: 'Daily',
        scope: ['Database', 'Configuration'],
        storage: 'Local Server'
    },
    audit: {
        lastUpdated: '',
        updatedBy: ''
    }
};

// User Login with app-user restriction
router.post('/login', async (req, res) => {
    try {
        const { email, password, type } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, error: 'Email, password and type are required' });
        }

        const user = await User.findOne({ email, password });

        if (!user) {
            return res.status(401).json({ success: false, error: 'Invalid email or password' });
        }
        // Check restriction for app user
        if (type === 'app user' && user.loginCount >= 1) {
            return res.status(403).json({
                success: false,
                error: 'Login limit reached for this account. Only 1 login allowed for app users.'
            });
        } else if (type === 'app user' && user.loginCount === 0) {
            user.loginCount = (user.loginCount || 0) + 1;
        }
        // Update login info
        user.lastLogin = new Date();
        await user.save();

        res.status(200).json({
            success: true,
            message: 'Login successful',
            data: user
        });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

// User Logout - Decrement loginCount for app users
router.post('/logout', async (req, res) => {
    try {
        const { _id, type } = req.body;

        if (!_id) {
            return res.status(400).json({ success: false, error: 'User ID is required' });
        }

        const user = await User.findById(_id);

        if (!user) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }

        // Decrement loginCount for app users only
        if (type === 'app user' && user.loginCount > 0) {
            user.loginCount = user.loginCount - 1;
            await user.save();
        }

        res.status(200).json({
            success: true,
            message: 'Logout successful',
            data: { loginCount: user.loginCount }
        });
    } catch (err) {
        console.error('Logout error:', err);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

// Create a new user
router.post('/', async (req, res) => {
    try {
        const { name, branchName, type, email, password, status, accessType, templateCount } = req.body;
        const user = new User({
            name,
            branchName,
            type,
            email,
            password,
            status,
            accessType,
            templateCount
        });
        await user.save();
        res.status(201).json({ success: true, data: user });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
});

// Get all users (with optional type filter)
router.get('/', async (req, res) => {
    try {
        const { type } = req.query;
        const query = type ? { type } : {};

        const users = await User.find(query).sort({ createdAt: -1 });
        res.status(200).json({ success: true, count: users.length, data: users });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// Premium Admin Settings (Settings page)
router.get('/premium-settings', async (req, res) => {
    try {
        const { adminid } = req.query;
        if (!adminid) {
            return res.status(400).json({ success: false, error: 'adminid is required' });
        }

        const doc = await PremiumAdminSettings.findOne({ adminid }).lean();

        // Deep merge: Database settings take precedence over defaults
        const settings = doc?.settings || DEFAULT_PREMIUM_SETTINGS;

        // Return audit derived from db timestamps if not present
        const audit = {
            lastUpdated: doc?.updatedAt ? new Date(doc.updatedAt).toLocaleString() : (settings.audit?.lastUpdated || ''),
            updatedBy: doc?.updatedBy || settings.audit?.updatedBy || ''
        };

        return res.status(200).json({ success: true, settings: { ...settings, audit } });
    } catch (err) {
        console.error('premium-settings GET error:', err);
        return res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

router.put('/premium-settings', async (req, res) => {
    try {
        const { adminid } = req.query;
        const { settings, updatedBy } = req.body || {};

        if (!adminid) {
            return res.status(400).json({ success: false, error: 'adminid is required' });
        }
        if (!settings || typeof settings !== 'object') {
            return res.status(400).json({ success: false, error: 'settings object is required' });
        }


        const doc = await PremiumAdminSettings.findOneAndUpdate(
            { adminid },
            { settings, updatedBy: updatedBy || '' },
            { upsert: true, new: true }
        ).lean();

        // Sync General Settings to User Collection
        if (settings.general) {
            const userUpdate = {};
            if (settings.general.adminName) userUpdate.name = settings.general.adminName;
            if (settings.general.companyName) userUpdate.companyName = settings.general.companyName;
            if (settings.general.email) userUpdate.email = settings.general.email;
            if (settings.general.phone) userUpdate.phone = settings.general.phone;

            if (Object.keys(userUpdate).length > 0) {
                await User.findByIdAndUpdate(adminid, userUpdate);
            }
        }

        const audit = {
            lastUpdated: doc?.updatedAt ? new Date(doc.updatedAt).toLocaleString() : new Date().toLocaleString(),
            updatedBy: doc?.updatedBy || updatedBy || ''
        };

        return res.status(200).json({ success: true, settings: { ...doc.settings, audit } });
    } catch (err) {
        console.error('premium-settings PUT error:', err);
        return res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

// Get single user
router.get('/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }
        res.status(200).json({ success: true, data: user });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
});

// Update user
router.put('/:id', async (req, res) => {
    try {
        const { name, branchName, type, email, password, status, accessType, templateCount, companyName, phone } = req.body;
        const user = await User.findByIdAndUpdate(
            req.params.id,
            { name, branchName, type, email, password, status, accessType, templateCount, companyName, phone },
            { new: true, runValidators: true }
        );
        if (!user) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }
        res.status(200).json({ success: true, data: user });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
});

// Update user status
router.patch('/:id/status', async (req, res) => {
    try {
        const { status } = req.body;
        if (!status) {
            return res.status(400).json({ success: false, error: 'Status is required' });
        }
        const user = await User.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true, runValidators: true }
        );
        if (!user) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }
        res.status(200).json({ success: true, data: user });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
});

// Delete user
router.delete('/:id', async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }
        res.status(200).json({ success: true, data: {} });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
});

module.exports = router;
