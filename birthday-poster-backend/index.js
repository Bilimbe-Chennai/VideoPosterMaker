const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const uploadRoutes = require('./routes/upload');
const adminRoutes = require('./routes/admin');
const clientRoutes = require('./routes/client');
const photomergeRoutes = require('./routes/photomerge');
const userRoutes = require('./routes/user');
const activityHistoryRoutes = require('./routes/activityHistory');
const campaignRoutes = require('./routes/campaigns');
const initDb = require("./InitDB");
const path = require('path');
const os = require("os");
const bodyParser = require("body-parser");
const app = express();
app.use(bodyParser.json({ limit: "50mb" })); // increase payload limit
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:3001",
  "http://localhost:7000",
  "http://127.0.0.1:3000",
  "http://127.0.0.1:3001",
  "https://bilimbe-bday-poster-frontend.onrender.com",
  "https://bilimbe-bday-poster-backend.onrender.com",
  "https://app.bilimbebrandactivations.com",
  "https://api.bilimbebrandactivations.com"
];
app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (e.g., mobile apps, curl, Postman)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.log(`Blocked by CORS: ${origin}`);
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: "GET,POST,PUT,DELETE,OPTIONS",
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);
app.use(express.json({ limit: '500mb' }));
app.use(express.urlencoded({ limit: '500mb', extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use("/temp", express.static(path.join(os.tmpdir())));
app.use('/api/upload', uploadRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/client', clientRoutes);
app.use('/api/photomerge', photomergeRoutes);
app.use('/api/users', userRoutes);
app.use('/api/activity-history', activityHistoryRoutes);
app.use('/api/campaigns', campaignRoutes);
app.use('/api/report-downloads', require('./routes/reportDownloads'));
app.use('/api/subscription', require('./routes/subscription'));
app.use('/api/billing', require('./routes/billing'));
app.use('/api/notifications', require('./routes/notifications'));
// app.get("/photomergeapp/share/:id", (req, res) => {
//   const { id } = req.params;
//   // Redirect to app deep link
//   res.redirect(`photomergeapp://share/${id}`);
// });

// ? Health check route for quick debugging
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", origin: req.headers.origin || "no-origin" });
});

// Start campaign scheduler for automatic activation of scheduled campaigns
const { startCampaignScheduler } = require('./utils/campaignScheduler');
const mongoose = require('mongoose');
let campaignSchedulerInterval = null;

// Initialize database connection
initDb();

// Start scheduler when database connection is ready
const startSchedulerWhenReady = () => {
  if (mongoose.connection.readyState === 1) {
    // Connection is ready
    try {
      campaignSchedulerInterval = startCampaignScheduler();
      console.log('✅ Campaign scheduler started successfully');
    } catch (error) {
      console.error('❌ Error starting campaign scheduler:', error);
    }
  } else {
    // Wait and check again
    setTimeout(startSchedulerWhenReady, 2000);
  }
};

// Start checking for DB connection
mongoose.connection.on('connected', () => {
  console.log('✅ MongoDB connected - starting campaign scheduler...');
  startSchedulerWhenReady();
});

// Also try to start after a delay as fallback
setTimeout(() => {
  if (!campaignSchedulerInterval && mongoose.connection.readyState === 1) {
    startSchedulerWhenReady();
  }
}, 5000);

app.listen(process.env.PORT, () => {
  console.log('Server running on http://localhost:7000');
  console.log('Campaign scheduler will start after database connection is established.');
});
