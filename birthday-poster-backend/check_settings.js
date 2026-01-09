const mongoose = require('mongoose');
const AdminSettings = require('./models/AdminSettings');
require('dotenv').config();

async function checkSettings() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');
        const settings = await AdminSettings.find();
        console.log('Admin Settings:', JSON.stringify(settings, null, 2));
        mongoose.connection.close();
    } catch (err) {
        console.error('Error:', err);
    }
}

checkSettings();
