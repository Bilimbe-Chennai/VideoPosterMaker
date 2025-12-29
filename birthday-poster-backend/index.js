const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const uploadRoutes = require('./routes/upload');
const adminRoutes = require('./routes/admin');
const clientRoutes = require('./routes/client');
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
// app.get("/photomergeapp/share/:id", (req, res) => {
//   const { id } = req.params;
//   // Redirect to app deep link
//   res.redirect(`photomergeapp://share/${id}`);
// });

// ? Health check route for quick debugging
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", origin: req.headers.origin || "no-origin" });
});
app.listen(process.env.PORT, () => console.log('Server running on http://localhost:7000'));
