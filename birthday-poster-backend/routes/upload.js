const express = require("express");
const { createCanvas, loadImage } = require("canvas");
const ffmpeg = require("fluent-ffmpeg");
const { GridFSBucket, ObjectId } = require("mongodb");
const mongoose = require("mongoose");
const axios = require("axios");
const Media = require("../models/Media");
const ActivityHistory = require("../models/ActivityHistory");
const { Readable } = require("stream");
const path = require("path");
const os = require("os");
const fs = require("fs/promises"); // ✅ promise-based fs
const router = express.Router();
const { getConnection } = require("../InitDB");
const OpenAI = require("openai");
require("dotenv").config();
const archiver = require("archiver");
const QRCode = require("qrcode");
const fetch = require("node-fetch");
// OpenAI setup
const openai = new OpenAI({
  apiKey: process.env.OPEN_AI_API_KEY, // ensure this is set in your .env file
});
// Helper: upload buffer to GridFS
async function uploadToGridFS(filename, buffer, contentType) {
  const { bucket } = getConnection();
  return new Promise((resolve, reject) => {
    const uploadStream = bucket.openUploadStream(filename, { contentType });
    Readable.from(buffer)
      .pipe(uploadStream)
      .on("error", reject)
      .on("finish", () => resolve(uploadStream.id));
  });
}

// Helper: Log activity history
async function logActivity({
  customerPhone,
  customerName,
  customerEmail,
  activityType,
  activityDescription,
  mediaId,
  templateName,
  branchName,
  adminid,
  metadata = {}
}) {
  try {
    if (!customerPhone || !customerName || !activityType || !activityDescription || !adminid) {
      console.warn('Missing required fields for activity log:', { customerPhone, customerName, activityType, adminid });
      return;
    }

    const activity = new ActivityHistory({
      customerPhone: String(customerPhone),
      customerName: String(customerName),
      customerEmail: customerEmail || '',
      activityType,
      activityDescription,
      mediaId: mediaId || null,
      templateName: templateName || '',
      branchName: branchName || '',
      adminid: String(adminid),
      metadata
    });

    await activity.save();
  } catch (err) {
    console.error('Error logging activity:', err);
    // Don't throw - activity logging should not break the main flow
  }
}
//whatsapp share function
router.post("/share", async (req, res) => {
  try {
    const toNumber = req.body.mobile;
    const _id = req.body._id;
    const linksend = req.body.link;
    const token = process.env.CHATMYBOT_TOKEN;
    if (!toNumber || !linksend || !_id) {
      return res
        .status(400)
        .json({ error: "Phone, link, and _id are required" });
    }
    if (!mongoose.Types.ObjectId.isValid(_id)) {
      return res.status(400).json({ error: "Invalid media ID" });
    }
    if (!token) {
      return res.status(500).json({ error: "ChatMyBot token not configured" });
    }
    const payload = [
      {
        to: toNumber,
        type: "template",
        template: {
          id: process.env.WHATSAPP_TEMPLATE_ID,
          language: {
            code: "en",
          },
          components: [
            {
              type: "body",
              parameters: [
                {
                  type: "text",
                  text: req.body.message || linksend,
                },
              ],
            },
          ],
        },
      },
    ];
    // console.log("payload",payload)
    // Send to ChatMyBot API
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
    // console.log("ChatMyBot response:", response.data);
    if (response.status !== 200) {
      return res.status(response.status).json({
        error: "Failed to send message via ChatMyBot",
        details: data,
      });
    }
    //Update media status if API call succeeded
    const updatedMedia = await Media.findByIdAndUpdate(
      _id,
      {
        whatsappstatus: "yes",
        updatedAt: new Date()
      },
      { new: true }
    );

    // Log activity
    if (updatedMedia) {
      await logActivity({
        customerPhone: updatedMedia.whatsapp || updatedMedia.mobile || '',
        customerName: updatedMedia.name || 'Unknown',
        customerEmail: updatedMedia.email || '',
        activityType: 'photo_shared_whatsapp',
        activityDescription: `Shared ${updatedMedia.template_name || 'photo'} via WhatsApp`,
        mediaId: updatedMedia._id,
        templateName: updatedMedia.template_name || '',
        branchName: updatedMedia.branchName || '',
        adminid: updatedMedia.adminid || ''
      });
    }

    return res.json({ success: true, data: updatedMedia });
  } catch (err) {
    console.error("Server error in /share:", err.response?.data || err.message);
    return res.status(500).json({
      error: "Internal server error",
      details: err.response?.data || err.message,
    });
  }
});

// New route for custom messages
router.post("/custom-share", async (req, res) => {
  try {
    const toNumber = req.body.mobile;
    const _id = req.body._id;
    const userName = req.body.userName;
    const message = req.body.message;
    const token = process.env.CHATMYBOT_TOKEN;

    if (!toNumber || !message || !_id) {
      return res.status(400).json({ error: "Phone, message, and _id are required" });
    }

    if (!token) {
      return res.status(500).json({ error: "ChatMyBot token not configured" });
    }
    const payload = [
      {
        to: toNumber,
        type: "template",
        template: {
          id: process.env.WHATSAPP_TEMPLATE_ID_APP,
          language: {
            code: "en",
          },
          components: [
            {
              type: "body",
              parameters: [
                {
                  type: "text",
                  text: userName,
                },
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

    console.log("ChatMyBot Response:", JSON.stringify(response.data, null, 2));

    if (response.status !== 200 || (response.data && response.data.status === "error")) {
      return res.status(response.status || 500).json({
        error: "Failed to send message via ChatMyBot",
        details: response.data
      });
    }

    // Optional: Update media status as well
    const updatedMedia = await Media.findByIdAndUpdate(
      _id,
      {
        whatsappstatus: "yes",
        updatedAt: new Date()
      },
      { new: true }
    );

    // Log activity
    if (updatedMedia) {
      await logActivity({
        customerPhone: updatedMedia.whatsapp || updatedMedia.mobile || '',
        customerName: updatedMedia.name || 'Unknown',
        customerEmail: updatedMedia.email || '',
        activityType: 'message_sent',
        activityDescription: `Custom message sent via WhatsApp`,
        mediaId: updatedMedia._id,
        templateName: updatedMedia.template_name || '',
        branchName: updatedMedia.branchName || '',
        adminid: updatedMedia.adminid || '',
        metadata: { message: message }
      });
    }

    res.json({ success: true, data: updatedMedia });
  } catch (error) {
    console.error("Server error in /custom-share:", error.response?.data || error.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Increment share or download count
router.post("/update-count", async (req, res) => {
  try {
    const { id, field } = req.body;

    if (!id || !field) {
      return res.status(400).json({ error: "Missing ID or field" });
    }

    const validFields = [
      "whatsappsharecount",
      "facebooksharecount",
      "twittersharecount",
      "instagramsharecount",
      "downloadcount",
      "urlclickcount"
    ];

    if (!validFields.includes(field)) {
      return res.status(400).json({ error: "Invalid field" });
    }

    // Try to find by posterVideoId first, then by _id if not found
    let updatedMedia = await Media.findOneAndUpdate(
      { posterVideoId: id },
      {
        $inc: { [field]: 1 },
        $set: { updatedAt: new Date() }
      },
      { new: true, runValidators: true }
    );

    // If not found by posterVideoId, try finding by _id
    if (!updatedMedia && mongoose.Types.ObjectId.isValid(id)) {
      updatedMedia = await Media.findOneAndUpdate(
        { _id: id },
        {
          $inc: { [field]: 1 },
          $set: { updatedAt: new Date() }
        },
        { new: true, runValidators: true }
      );
    }

    if (!updatedMedia) {
      return res.status(404).json({ error: "Media not found" });
    }

    // Log activity based on field type
    const activityTypeMap = {
      'whatsappsharecount': 'photo_shared_whatsapp',
      'facebooksharecount': 'photo_shared_facebook',
      'twittersharecount': 'photo_shared_twitter',
      'instagramsharecount': 'photo_shared_instagram',
      'downloadcount': 'photo_downloaded',
      'urlclickcount': 'url_clicked'
    };

    const activityType = activityTypeMap[field];
    if (activityType) {
      const activityDescriptionMap = {
        'photo_shared_whatsapp': `Shared ${updatedMedia.template_name || 'photo'} via WhatsApp`,
        'photo_shared_facebook': `Shared ${updatedMedia.template_name || 'photo'} on Facebook`,
        'photo_shared_twitter': `Shared ${updatedMedia.template_name || 'photo'} on Twitter`,
        'photo_shared_instagram': `Shared ${updatedMedia.template_name || 'photo'} on Instagram`,
        'photo_downloaded': `Downloaded ${updatedMedia.template_name || 'photo'}`,
        'url_clicked': `Viewed share screen for ${updatedMedia.template_name || 'photo'}`
      };

      await logActivity({
        customerPhone: updatedMedia.whatsapp || updatedMedia.mobile || '',
        customerName: updatedMedia.name || 'Unknown',
        customerEmail: updatedMedia.email || '',
        activityType,
        activityDescription: activityDescriptionMap[activityType] || `Updated ${field}`,
        mediaId: updatedMedia._id,
        templateName: updatedMedia.template_name || '',
        branchName: updatedMedia.branchName || '',
        adminid: updatedMedia.adminid || ''
      });
    }

    return res.json({ success: true, data: updatedMedia });
  } catch (err) {
    console.error("Error updating count:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// Generate birthday message using AI
async function generateBirthdayMessage(name) {
  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "system",
        content: "You are a cheerful birthday poster assistant.",
      },
      { role: "user", content: `Write a cute birthday message for ${name}.` },
    ],
    max_tokens: 60,
  });

  return response.choices[0].message.content.trim();
}
// Get GridFS bucket
const getGridFSBucket = () => {
  const { bucket } = getConnection();
  return bucket;
};
// Helper to upload buffer to GridFS
// const uploadToGridFS = async (filename, buffer, mimetype) => {
//   const bucket = getGridFSBucket();
//   const stream = bucket.openUploadStream(filename, { contentType: mimetype });
//   const readable = Readable.from(buffer);
//   await readable.pipe(stream);
//   return new Promise((resolve, reject) => {
//     stream.on("finish", () => resolve(stream.id));
//     stream.on("error", reject);
//   });
// };
// Save temp file for ffmpeg
const saveTempFile = async (buffer, extension) => {
  const tempFilePath = path.join(
    os.tmpdir(),
    `${Date.now()}-${Math.random().toString(36).slice(2)}.${extension}`
  );
  await fs.writeFile(tempFilePath, buffer, (err) => {
    if (err) {
      console.error("Error saving file:", err);
      return;
    }
    console.log("File saved successfully!");
  });

  return tempFilePath;
};
//download file function
router.get("/file/:id", async (req, res) => {
  try {
    if (!ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        error: "Invalid file ID",
        received: req.params.id,
      });
    }

    const fileId = new ObjectId(req.params.id);
    //const fileId = new mongoose.Types.ObjectId(req.params.id);
    const bucket = getGridFSBucket();

    const downloadStream = bucket.openDownloadStream(fileId);

    // Set headers (optional but helpful)
    // downloadStream.on("file", (file) => {
    //   res.setHeader(
    //     "Content-Type",
    //     file.contentType || "application/octet-stream"
    //   );
    //   res.setHeader(
    //     "Content-Disposition",
    //     `attachment; filename="${file.filename}"`
    //   );
    // });
    downloadStream.on("file", (file) => {
      res.setHeader("Content-Type", file.contentType || "video/mp4");

      if (req.query.download === "true") {
        // Force download (Windows behavior you already have)
        res.setHeader(
          "Content-Disposition",
          `attachment; filename="${file.filename}"`
        );
      } else {
        // Allow inline playback (needed for iOS Safari <video>)
        res.setHeader(
          "Content-Disposition",
          `inline; filename="${file.filename}"`
        );
      }
    });

    // Error handling for stream
    downloadStream.on("error", (err) => {
      console.error("Stream error:", err);
      return res.status(404).send("File not found or download error");
    });

    downloadStream.pipe(res);
  } catch (err) {
    console.error("Error:", err);
    res.status(404).send("File not found");
  }
});
//download all files with name filter function
// router.get("/download-all", async (req, res) => {
//   try {
//     const bucket = getGridFSBucket();
//  // Find document by name
//     // const doc = await Media.find({ name:"Idfc" });
//     // if (!doc) {
//     //   return res.status(404).send("No video found with that name");
//     // }

//     // Collect file IDs (ignore null/undefined)
//     const fileIds = [doc.video1Id, doc.video2Id, doc.posterVideoId].filter(Boolean);
//     if (!fileIds.length) {
//       return res.status(404).send("No videos found for this record");
//     }
//     // Set headers for ZIP download
//     res.setHeader("Content-Type", "application/zip");
//     res.setHeader("Content-Disposition", 'attachment; filename="all_files.zip"');

//     const archive = archiver("zip", { zlib: { level: 9 } });
//     archive.pipe(res);

//     // // Fetch all files from GridFS
//     // const files = await bucket.find({}).toArray();

//     // files.forEach((file) => {
//     //   // Stream each file with its original name
//     //   const stream = bucket.openDownloadStream(file._id);
//     //   archive.append(stream, { name: file.filename });
//     // });
// // Add each GridFS file to the zip
//     for (const [index, fileId] of fileIds.entries()) {
//       const fileIdObj = new mongoose.Types.ObjectId(fileId);

//       const files = await bucket.find({ _id: fileIdObj }).toArray();
//       if (!files.length) continue;

//       const file = files[0];
//       const stream = bucket.openDownloadStream(fileIdObj);

//       // Keep original filename if available, otherwise fallback
//       archive.append(stream, { name: file.filename });
//     }
//     archive.finalize();
//   } catch (err) {
//     console.error("Error creating zip:", err);
//     res.status(500).send("Error downloading files");
//   }
// });
router.get("/download-all", async (req, res) => {
  try {
    const bucket = getGridFSBucket();

    // Set headers for ZIP download
    res.setHeader("Content-Type", "application/zip");
    res.setHeader("Content-Disposition", 'attachment; filename="merged_videos.zip"');

    const archive = archiver("zip", { zlib: { level: 9 } });
    archive.pipe(res);

    // Find files where filename includes "merged"
    const files = await bucket.find({ filename: /merged/ }).toArray();

    if (!files.length) {
      return res.status(404).send("No merged videos found");
    }

    files.forEach((file) => {
      const stream = bucket.openDownloadStream(file._id);
      archive.append(stream, { name: file.filename }); // keep original name
    });

    archive.finalize();
  } catch (err) {
    console.error("Error creating zip:", err);
    res.status(500).send("Error downloading merged videos");
  }
});

// GET all media items with advanced filtering and pagination
// router.get("/all", async (req, res) => {
//   try {
//     const { branch, type, startDate, endDate, source, page = 1, limit = 20 } = req.query;
//     let query = {};

//     if (branch) query.branchName = branch;
//     if (type) query.type = type;
//     if (source) query.source = source;

//     if (startDate || endDate) {
//       query.createdAt = {};
//       if (startDate) query.createdAt.$gte = new Date(startDate);
//       if (endDate) query.createdAt.$lte = new Date(endDate);
//     }

//     const skip = (parseInt(page) - 1) * parseInt(limit);
//     const total = await Media.countDocuments(query);
//     const mediaItems = await Media.find(query)
//       .sort({ updatedAt: -1 })
//       .skip(skip)
//       .limit(parseInt(limit));

//     res.json({
//       success: true,
//       total,
//       page: parseInt(page),
//       totalPages: Math.ceil(total / parseInt(limit)),
//       data: mediaItems
//     });
//   } catch (err) {
//     console.error("Error fetching media items:", err);
//     res.status(500).json({ error: "Server error while fetching media items" });
//   }
// });
// GET all media items
// GET all media items
router.get("/all", async (req, res) => {
  try {
    const { adminid } = req.query;
    let query = {};
    if (adminid) {
      query.adminid = adminid;
    }
    
    console.log('Fetching media items with query:', query);
    const mediaItems = await Media.find(query).sort({ createdAt: -1 }).lean(); // Get all items, newest first, use lean() for better performance
    console.log(`Found ${mediaItems.length} media items`);
    
    // Return as array directly (no need to reverse since we're sorting by createdAt: -1)
    res.json(mediaItems || []);
  } catch (err) {
    console.error("Error fetching media items:", err);
    res.status(500).json({ error: "Server error while fetching media items", message: err.message });
  }
});
// GET unique branches
router.get("/branches", async (req, res) => {
  try {
    const branches = await Media.distinct("branchName");
    res.json({ success: true, branches: branches.filter(b => b) });
  } catch (err) {
    console.error("Error fetching branches:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET export stats as CSV
router.get("/export-stats", async (req, res) => {
  try {
    const media = await Media.find().sort({ createdAt: -1 });
    let csv = "Name,Date,Type,WhatsApp,Branch,Shares(WA),Shares(FB),Shares(X),Shares(IG),Downloads\n";

    media.forEach(m => {
      csv += `"${m.name || ""}",${m.date || ""},${m.type || ""},"${m.whatsapp || ""}",` +
        `"${m.branchName || ""}",${m.whatsappsharecount || 0},${m.facebooksharecount || 0},` +
        `${m.twittersharecount || 0},${m.instagramsharecount || 0},${m.downloadcount || 0}\n`;
    });

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename=poster_stats_${Date.now()}.csv`);
    res.status(200).send(csv);
  } catch (err) {
    console.error("Export error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET dashboard statistics
router.get("/stats", async (req, res) => {
  try {
    const totalPosters = await Media.countDocuments();
    const stats = await Media.aggregate([
      {
        $group: {
          _id: null,
          totalWhatsApp: { $sum: "$whatsappsharecount" },
          totalFB: { $sum: "$facebooksharecount" },
          totalX: { $sum: "$twittersharecount" },
          totalInstagram: { $sum: "$instagramsharecount" },
          totalDownloads: { $sum: "$downloadcount" },
        },
      },
    ]);

    const branchStats = await Media.aggregate([
      { $group: { _id: "$branchName", count: { $sum: 1 } } },
    ]);

    const typeStats = await Media.aggregate([
      { $group: { _id: "$type", count: { $sum: 1 } } },
    ]);

    res.json({
      totalPosters,
      engagement: stats[0] || {
        totalWhatsApp: 0,
        totalFB: 0,
        totalX: 0,
        totalInstagram: 0,
        totalDownloads: 0,
      },
      branchStats,
      typeStats,
    });
  } catch (err) {
    console.error("Error fetching stats:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET dashboard metrics with growth calculations
router.get("/dashboard-metrics", async (req, res) => {
  try {
    const { adminid } = req.query;
    let query = {};
    if (adminid) {
      query.adminid = adminid;
    }
    query.source = "Photo Merge App";

    // Helper function to calculate growth
    // Returns count change as percentage based on 100% scale
    const calculateGrowth = (current, previous) => {
      // Calculate the count change
      const countChange = current - previous;
      // Return the count change directly as percentage (count change = percentage value)
      // If change is +2, show 2%; if change is -5, show -5%
      return parseFloat(countChange.toFixed(1));
    };

    // Helper function to generate trend path configuration based on growth value
    const generateTrendPathConfig = (growth) => {
      const growthValue = parseFloat(growth) || 0;
      
      // Normalize growth to a -50 to +50 scale for better visualization
      const normalizedGrowth = Math.max(-50, Math.min(50, growthValue));
      const scaleFactor = normalizedGrowth / 50; // -1 to 1
      
      // For 60x30 viewBox: X ranges 0-60, Y ranges 0-30 (lower Y = higher on screen)
      const startY = 20; // Middle baseline
      const endYOffset = -scaleFactor * 12; // Move up/down based on growth (max 12px movement)
      const endY = startY + endYOffset;
      
      // Ensure Y stays within viewBox bounds (0-30)
      const clampedEndY = Math.max(5, Math.min(25, endY));
      
      // Create smooth curve points with control points for better curve
      const midY1 = startY + (endYOffset * 0.2);
      const midY2 = startY + (endYOffset * 0.6);
      
      // Generate dynamic Bezier curve path
      const path = `M5,${startY} C18,${startY - scaleFactor * 2} 32,${midY1 + scaleFactor * 1} 45,${midY2} C48,${midY2 + scaleFactor * 1} 50,${clampedEndY - scaleFactor * 0.5} 55,${clampedEndY}`;
      
      return {
        points: path,
        endX: 55,
        endY: Math.round(clampedEndY),
        isPositive: growthValue >= 0,
        normalizedGrowth: normalizedGrowth,
        scaleFactor: scaleFactor
      };
    };

    // Current period dates
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    today.setHours(0, 0, 0, 0);
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
    lastMonthEnd.setHours(23, 59, 59, 999);

    const last30DaysStart = new Date(today);
    last30DaysStart.setDate(last30DaysStart.getDate() - 30);
    
    const last60DaysStart = new Date(today);
    last60DaysStart.setDate(last60DaysStart.getDate() - 60);
    const last30DaysEnd = new Date(today);
    last30DaysEnd.setDate(last30DaysEnd.getDate() - 30);

    // Fetch all data
    const allItems = await Media.find(query).lean();

    // Filter items by date ranges
    const currentMonthItems = allItems.filter(item => {
      const itemDate = new Date(item.date || item.createdAt);
      return itemDate >= lastMonthStart && itemDate <= now;
    });

    const lastMonthItems = allItems.filter(item => {
      const itemDate = new Date(item.date || item.createdAt);
      return itemDate >= new Date(now.getFullYear(), now.getMonth() - 2, 1) && itemDate < lastMonthStart;
    });

    const todayItems = allItems.filter(item => {
      const itemDate = new Date(item.date || item.createdAt);
      return itemDate >= today && itemDate <= now;
    });

    const yesterdayItems = allItems.filter(item => {
      const itemDate = new Date(item.date || item.createdAt);
      return itemDate >= yesterday && itemDate < today;
    });

    const last30DaysItems = allItems.filter(item => {
      const itemDate = new Date(item.date || item.createdAt);
      return itemDate >= last30DaysStart && itemDate <= now;
    });

    const previous30DaysItems = allItems.filter(item => {
      const itemDate = new Date(item.date || item.createdAt);
      return itemDate >= last60DaysStart && itemDate <= last30DaysEnd;
    });

    // Calculate current metrics
    const totalCustomersSet = new Set();
    const lastMonthCustomersSet = new Set();
    
    allItems.forEach(item => {
      const phone = item.whatsapp || item.mobile || '';
      const key = phone && phone !== 'N/A' ? phone : (item.name || 'Unknown');
      const itemDate = new Date(item.date || item.createdAt);
      
      if (itemDate >= lastMonthStart && itemDate <= now) {
        totalCustomersSet.add(key);
      }
      
      if (itemDate >= new Date(now.getFullYear(), now.getMonth() - 2, 1) && itemDate < lastMonthStart) {
        lastMonthCustomersSet.add(key);
      }
    });

    const totalCustomers = totalCustomersSet.size;
    const totalCustomersLastMonth = lastMonthCustomersSet.size;
    const totalPhotos = currentMonthItems.length;
    const totalPhotosLastMonth = lastMonthItems.length;
    const photosToday = todayItems.length;
    const photosYesterday = yesterdayItems.length;

    // Calculate shares (social only)
    const totalShares = currentMonthItems.reduce((acc, item) => {
      return acc + (item.whatsappsharecount || 0) +
        (item.facebooksharecount || 0) +
        (item.twittersharecount || 0) +
        (item.instagramsharecount || 0);
    }, 0);

    const totalSharesLastMonth = lastMonthItems.reduce((acc, item) => {
      return acc + (item.whatsappsharecount || 0) +
        (item.facebooksharecount || 0) +
        (item.twittersharecount || 0) +
        (item.instagramsharecount || 0);
    }, 0);

    // Calculate downloads (separate)
    const totalDownloads = currentMonthItems.reduce((acc, item) => {
      return acc + (item.downloadcount || 0);
    }, 0);

    const totalDownloadsLastMonth = lastMonthItems.reduce((acc, item) => {
      return acc + (item.downloadcount || 0);
    }, 0);

    // Calculate unique users for Share Tracking
    const uniqueUsersSet = new Set();
    const prevUniqueUsersSet = new Set();
    
    last30DaysItems.forEach(item => {
      const phone = item.whatsapp || item.mobile || item.name;
      if (phone) uniqueUsersSet.add(phone);
    });

    previous30DaysItems.forEach(item => {
      const phone = item.whatsapp || item.mobile || item.name;
      if (phone) prevUniqueUsersSet.add(phone);
    });

    const uniqueUsers = uniqueUsersSet.size;
    const prevUniqueUsers = prevUniqueUsersSet.size;

    // Calculate total clicks from actual urlclickcount field
    const totalClicks = last30DaysItems.reduce((acc, item) => acc + (item.urlclickcount || 0), 0);
    const prevTotalClicks = previous30DaysItems.reduce((acc, item) => acc + (item.urlclickcount || 0), 0);

    // Calculate photos shared
    const photosSharedSet = new Set();
    const prevPhotosSharedSet = new Set();

    last30DaysItems.forEach(item => {
      if (item.photoId || item._id) {
        photosSharedSet.add(item.photoId || item._id.toString());
      }
    });

    previous30DaysItems.forEach(item => {
      if (item.photoId || item._id) {
        prevPhotosSharedSet.add(item.photoId || item._id.toString());
      }
    });

    const photosShared = photosSharedSet.size;
    const prevPhotosShared = prevPhotosSharedSet.size;

    // Calculate growth percentages
    const metrics = {
      dashboard: {
        totalCustomers: {
          value: totalCustomers,
          growth: calculateGrowth(totalCustomers, totalCustomersLastMonth)
        },
        totalPhotos: {
          value: totalPhotos,
          growth: calculateGrowth(totalPhotos, totalPhotosLastMonth)
        },
        photosToday: {
          value: photosToday,
          growth: calculateGrowth(photosToday, photosYesterday)
        },
        totalShares: {
          value: totalShares,
          growth: calculateGrowth(totalShares, totalSharesLastMonth)
        }
      },
      customers: {
        totalCustomers: {
          value: totalCustomers,
          growth: calculateGrowth(totalCustomers, totalCustomersLastMonth)
        },
        activeToday: {
          value: todayItems.length,
          growth: calculateGrowth(photosToday, photosYesterday)
        },
        totalVisits: {
          value: currentMonthItems.reduce((acc, item) => acc + 1, 0),
          growth: calculateGrowth(currentMonthItems.length, lastMonthItems.length)
        },
        avgVisits: {
          value: totalCustomers > 0 ? parseFloat((currentMonthItems.length / totalCustomers).toFixed(1)) : 0,
          growth: calculateGrowth(
            totalCustomers > 0 ? currentMonthItems.length / totalCustomers : 0,
            totalCustomersLastMonth > 0 ? lastMonthItems.length / totalCustomersLastMonth : 0
          )
        }
      },
      shareTracking: {
        totalShares: {
          value: last30DaysItems.reduce((acc, item) => {
            return acc + (item.whatsappsharecount || 0) +
              (item.facebooksharecount || 0) +
              (item.twittersharecount || 0) +
              (item.instagramsharecount || 0);
          }, 0),
          growth: calculateGrowth(
            last30DaysItems.reduce((acc, item) => {
              return acc + (item.whatsappsharecount || 0) +
                (item.facebooksharecount || 0) +
                (item.twittersharecount || 0) +
                (item.instagramsharecount || 0);
            }, 0),
            previous30DaysItems.reduce((acc, item) => {
              return acc + (item.whatsappsharecount || 0) +
                (item.facebooksharecount || 0) +
                (item.twittersharecount || 0) +
                (item.instagramsharecount || 0);
            }, 0)
          ),
          trendPath: generateTrendPathConfig(
            calculateGrowth(
              last30DaysItems.reduce((acc, item) => {
                return acc + (item.whatsappsharecount || 0) +
                  (item.facebooksharecount || 0) +
                  (item.twittersharecount || 0) +
                  (item.instagramsharecount || 0);
              }, 0),
              previous30DaysItems.reduce((acc, item) => {
                return acc + (item.whatsappsharecount || 0) +
                  (item.facebooksharecount || 0) +
                  (item.twittersharecount || 0) +
                  (item.instagramsharecount || 0);
              }, 0)
            )
          )
        },
        totalDownloads: {
          value: last30DaysItems.reduce((acc, item) => acc + (item.downloadcount || 0), 0),
          growth: calculateGrowth(
            last30DaysItems.reduce((acc, item) => acc + (item.downloadcount || 0), 0),
            previous30DaysItems.reduce((acc, item) => acc + (item.downloadcount || 0), 0)
          ),
          trendPath: generateTrendPathConfig(
            calculateGrowth(
              last30DaysItems.reduce((acc, item) => acc + (item.downloadcount || 0), 0),
              previous30DaysItems.reduce((acc, item) => acc + (item.downloadcount || 0), 0)
            )
          )
        },
        uniqueUsers: {
          value: uniqueUsers,
          growth: calculateGrowth(uniqueUsers, prevUniqueUsers),
          trendPath: generateTrendPathConfig(calculateGrowth(uniqueUsers, prevUniqueUsers))
        },
        totalClicks: {
          value: totalClicks,
          growth: calculateGrowth(totalClicks, prevTotalClicks),
          trendPath: generateTrendPathConfig(calculateGrowth(totalClicks, prevTotalClicks))
        },
        photosShared: {
          value: photosShared,
          growth: calculateGrowth(photosShared, prevPhotosShared),
          trendPath: generateTrendPathConfig(calculateGrowth(photosShared, prevPhotosShared))
        }
      },
      photos: {
        totalPhotosGrowth: calculateGrowth(totalPhotos, totalPhotosLastMonth),
        photosTodayGrowth: calculateGrowth(photosToday, photosYesterday),
        sharesGrowth: calculateGrowth(totalShares, totalSharesLastMonth),
        ratingGrowth: calculateGrowth(
          last30DaysItems.length > 0 ? last30DaysItems.length : 0,
          previous30DaysItems.length > 0 ? previous30DaysItems.length : 0
        )
      }
    };

    res.json({
      success: true,
      metrics
    });
  } catch (err) {
    console.error("Error fetching dashboard metrics:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET analytics payload (KPI + charts + growth) for Premium Admin Analytics page
router.get("/analytics", async (req, res) => {
  try {
    const { adminid, range } = req.query;
    const days = Math.max(1, Math.min(365, parseInt(range || "7", 10) || 7));

    const query = {};
    if (adminid) query.adminid = adminid;
    // Note: Removed source filter to include all data for the admin

    const allItems = await Media.find(query).lean();

    const now = new Date();
    const currentPeriodStart = new Date(now);
    currentPeriodStart.setDate(now.getDate() - days);
    const previousPeriodStart = new Date(currentPeriodStart);
    previousPeriodStart.setDate(previousPeriodStart.getDate() - days);

    const toDate = (item) => new Date(item.date || item.createdAt);
    const getShareCount = (item) =>
      (item.whatsappsharecount || 0) +
      (item.facebooksharecount || 0) +
      (item.twittersharecount || 0) +
      (item.instagramsharecount || 0);
    
    const getDownloadCount = (item) => (item.downloadcount || 0);

    const currentData = allItems.filter((item) => {
      const d = toDate(item);
      return d >= currentPeriodStart && d <= now;
    });

    const previousData = allItems.filter((item) => {
      const d = toDate(item);
      return d >= previousPeriodStart && d < currentPeriodStart;
    });

    const calculateGrowth = (current, previous) => {
      // Calculate the count change
      const countChange = current - previous;
      // Return the count change directly as percentage (count change = percentage value)
      // If change is +2, show 2%; if change is -5, show -5%
      return parseFloat(countChange.toFixed(1));
    };

    const uniqueCustomers = (dataset) => {
      const set = new Set(dataset.map((i) => i.whatsapp || i.mobile || i.name).filter(Boolean));
      return set.size;
    };

    const conversionRate = (dataset) => {
      if (dataset.length === 0) return 0;
      const shared = dataset.filter((i) => getShareCount(i) > 0).length;
      return parseFloat(((shared / dataset.length) * 100).toFixed(1));
    };

    // KPIs
    const photosCurrent = currentData.length;
    const photosPrev = previousData.length;

    const sharesCurrent = currentData.reduce((a, i) => a + getShareCount(i), 0);
    const sharesPrev = previousData.reduce((a, i) => a + getShareCount(i), 0);

    const convCurrent = conversionRate(currentData);
    const convPrev = conversionRate(previousData);

    // Session (API-driven but derived): average engagement seconds based on activity
    const avgSessionSeconds = (dataset) => {
      if (dataset.length === 0) return 0;
      const avgTimePerPhoto = 150; // seconds
      const avgTimePerShare = 60; // seconds
      const totalPhotos = dataset.length;
      const totalShares = dataset.reduce((a, i) => a + getShareCount(i), 0);
      return Math.round((totalPhotos * avgTimePerPhoto + totalShares * avgTimePerShare) / totalPhotos);
    };

    const formatDuration = (seconds) => {
      const s = Math.max(0, Math.round(seconds || 0));
      const m = Math.floor(s / 60);
      const rem = s % 60;
      if (m <= 0) return `${rem}s`;
      return `${m}m ${rem}s`;
    };

    const sessionCurSeconds = avgSessionSeconds(currentData);
    const sessionPrevSeconds = avgSessionSeconds(previousData);

    // Trends (daily)
    const trends = {};
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const dayNum = String(d.getDate()).padStart(2, "0");
      const key = `${year}-${month}-${dayNum}`;
      trends[key] = { photos: 0, shares: 0, users: new Set(), uniqueCustomers: 0 };
    }

    currentData.forEach((item) => {
      const d = toDate(item);
      if (isNaN(d.getTime())) return;
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const dayNum = String(d.getDate()).padStart(2, "0");
      const key = `${year}-${month}-${dayNum}`;
      if (!trends[key]) return;
      trends[key].photos += 1;
      trends[key].shares += getShareCount(item);
      trends[key].users.add(item.whatsapp || item.mobile || item.name);
    });
    Object.keys(trends).forEach((k) => {
      trends[k].uniqueCustomers = trends[k].users.size;
      delete trends[k].users;
    });

    // Categories - Dynamic top 4 templates + Others
    const templateCounts = {};
    currentData.forEach((item) => {
      const templateName = item.template_name || item.templatename || item.type || "Others";
      templateCounts[templateName] = (templateCounts[templateName] || 0) + 1;
    });

    // Sort templates by count and get top 4
    const sortedTemplates = Object.entries(templateCounts)
      .filter(([name]) => name !== "Others")
      .sort((a, b) => b[1] - a[1]);
    
    const top4Templates = sortedTemplates.slice(0, 4);
    const remainingTemplates = sortedTemplates.slice(4);

    // Build categories object with top 4 + Others
    const categories = {};
    top4Templates.forEach(([name, count]) => {
      categories[name] = count;
    });

    // Sum all remaining templates as "Others"
    const othersCount = remainingTemplates.reduce((sum, [, count]) => sum + count, 0) + (templateCounts["Others"] || 0);
    if (othersCount > 0) {
      categories["Others"] = othersCount;
    }

    // Platforms + growth
    const platforms = { WhatsApp: 0, Facebook: 0, Instagram: 0, Direct: 0 };
    const prevPlatforms = { WhatsApp: 0, Facebook: 0, Instagram: 0, Direct: 0 };

    currentData.forEach((item) => {
      platforms.WhatsApp += item.whatsappsharecount || 0;
      platforms.Facebook += item.facebooksharecount || 0;
      platforms.Instagram += item.instagramsharecount || 0;
      platforms.Direct += item.downloadcount || 0;
    });
    previousData.forEach((item) => {
      prevPlatforms.WhatsApp += item.whatsappsharecount || 0;
      prevPlatforms.Facebook += item.facebooksharecount || 0;
      prevPlatforms.Instagram += item.instagramsharecount || 0;
      prevPlatforms.Direct += item.downloadcount || 0;
    });

    const platformGrowth = {};
    Object.keys(platforms).forEach((k) => {
      platformGrowth[k] = calculateGrowth(platforms[k], prevPlatforms[k]);
    });

    // Peak hours / best day
    const peakHours = new Array(24).fill(0);
    const dayPerformance = {};
    currentData.forEach((item) => {
      const d = toDate(item);
      if (isNaN(d.getTime())) return;
      peakHours[d.getHours()]++;
      const day = d.toLocaleDateString("en-US", { weekday: "long" });
      dayPerformance[day] = (dayPerformance[day] || 0) + 1;
    });

    const bestHourIndex = peakHours.indexOf(Math.max(...peakHours));
    const bestCategoryEntry = Object.entries(categories).sort((a, b) => b[1] - a[1])[0];
    const bestDay = Object.entries(dayPerformance).sort((a, b) => b[1] - a[1])[0]?.[0] || "N/A";

    const weekendCount = (dayPerformance["Saturday"] || 0) + (dayPerformance["Sunday"] || 0);
    const weekdayCount = Object.values(dayPerformance).reduce((a, b) => a + b, 0) - weekendCount;
    const trafficPattern = weekendCount > weekdayCount ? "High Weekend Traffic" : "Steady Weekday Traffic";

    const fastestPlatform = Object.entries(platforms).sort((a, b) => b[1] - a[1])[0]?.[0] || "WhatsApp";

    const uniqueCustomersCurrent = uniqueCustomers(currentData);
    const uniqueCustomersPrev = uniqueCustomers(previousData);

    const payload = {
      kpis: {
        photos: { value: photosCurrent, growth: calculateGrowth(photosCurrent, photosPrev) },
        shares: { value: sharesCurrent, growth: calculateGrowth(sharesCurrent, sharesPrev) },
        conversion: { value: convCurrent, growth: calculateGrowth(convCurrent, convPrev) },
        session: { value: formatDuration(sessionCurSeconds), growth: calculateGrowth(sessionCurSeconds, sessionPrevSeconds) },
      },
      uniqueCustomers: uniqueCustomersCurrent,
      uniqueCustomersGrowth: calculateGrowth(uniqueCustomersCurrent, uniqueCustomersPrev),
      trends,
      categories,
      platforms,
      platformGrowth,
      peakHours,
      insights: {
        bestTimeStr: `${bestHourIndex}:00 - ${bestHourIndex + 1}:00`,
        bestDay,
        bestCategory: bestCategoryEntry
          ? `${bestCategoryEntry[0]} (${photosCurrent > 0 ? Math.round((bestCategoryEntry[1] / photosCurrent) * 100) : 0}%)`
          : "N/A",
        growthPlatform: fastestPlatform,
        trafficPattern,
        recommendation: `Schedule ${fastestPlatform} campaigns on ${bestDay}s at ${bestHourIndex}:00 for max conversion.`,
      },
    };

    res.json({ success: true, analytics: payload });
  } catch (err) {
    console.error("Error fetching analytics:", err);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

// GET search media by metadata
router.get("/search", async (req, res) => {
  try {
    const { q, adminid } = req.query;
    if (!q) return res.status(400).json({ error: "Search query required" });

    const searchRegex = new RegExp(q, "i");
    const searchConditions = {
      $or: [
        { name: searchRegex },
        { whatsapp: searchRegex },
        { branchName: searchRegex },
      ],
    };

    let query = searchConditions;
    if (adminid) {
      query = {
        $and: [
          { adminid: adminid },
          searchConditions
        ]
      };
    }

    const results = await Media.find(query).sort({ updatedAt: -1 });

    res.json(results);
  } catch (err) {
    console.error("Search error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// DELETE single media item
router.delete("/:id", async (req, res) => {
  try {
    const id = req.params.id;
    if (!ObjectId.isValid(id)) return res.status(400).json({ error: "Invalid ID" });

    const media = await Media.findById(id);
    if (!media) return res.status(404).json({ error: "Media not found" });

    // Helper to delete from GridFS
    const { bucket } = getConnection();
    const fileFields = [
      "photoId", "videoId", "posterId", "video1Id", "video2Id",
      "posterVideoId", "mergedVideoId", "gifId", "audioId", "templateId"
    ];

    for (const field of fileFields) {
      if (media[field]) {
        try {
          await bucket.delete(new ObjectId(media[field]));
        } catch (e) {
          console.error(`Failed to delete file ${media[field]} from GridFS:`, e.message);
        }
      }
    }

    await Media.findByIdAndDelete(id);
    res.json({ success: true, message: "Media and associated files deleted" });
  } catch (err) {
    console.error("Delete error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST bulk delete media items
router.post("/bulk-delete", async (req, res) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: "Invalid or empty IDs array" });
    }

    const { bucket } = getConnection();
    const fileFields = [
      "photoId", "videoId", "posterId", "video1Id", "video2Id",
      "posterVideoId", "mergedVideoId", "gifId", "audioId", "templateId"
    ];

    for (const id of ids) {
      if (!ObjectId.isValid(id)) continue;
      const media = await Media.findById(id);
      if (!media) continue;

      for (const field of fileFields) {
        if (media[field]) {
          try {
            await bucket.delete(new ObjectId(media[field]));
          } catch (e) {
            console.error(`Failed to delete file ${media[field]} in bulk:`, e.message);
          }
        }
      }
      await Media.findByIdAndDelete(id);
    }

    res.json({ success: true, message: `${ids.length} items processed for deletion` });
  } catch (err) {
    console.error("Bulk delete error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});
// GET video info function
const getVideoMetadata = (videoPath) => {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(videoPath, (err, metadata) => {
      if (err) return reject(err);
      const stream = metadata.streams.find((s) => s.codec_type === "video");
      if (!stream) return reject("No video stream found");
      resolve({
        width: stream.width,
        height: stream.height,
        fps: eval(stream.r_frame_rate), // e.g., "30/1" → 30
      });
    });
  });
};
// split buffer file function
function splitBuffer(buffer, separator) {
  let parts = [];
  let start = 0;
  let index;
  while ((index = buffer.indexOf(separator, start)) !== -1) {
    parts.push(buffer.slice(start, index));
    start = index + separator.length;
  }
  parts.push(buffer.slice(start));
  return parts;
}
// video and photo merge for birthday
router.post("/videophoto", async (req, res) => {
  try {
    const contentType = req.headers["content-type"];
    if (!contentType || !contentType.includes("multipart/form-data")) {
      return res.status(400).json({ error: "Invalid content type" });
    }

    const boundary = "--" + contentType.split("boundary=")[1];
    let chunks = [];
    req.on("data", (chunk) => {
      chunks.push(chunk);
    });

    req.on("end", async () => {
      const buffer = Buffer.concat(chunks);
      const boundaryBuffer = Buffer.from(boundary);

      const parts = splitBuffer(buffer, boundaryBuffer).slice(1, -1); // remove first/last boundary markers
      let name, date, type;
      let photoBuffer, videoBuffer;
      const whatsappstatus = "pending";
      // Split by boundary, keep binary intact

      parts.forEach((part) => {
        const [rawHeaders, rawBody] = splitBuffer(
          part,
          Buffer.from("\r\n\r\n")
        );
        const headersText = rawHeaders.toString();
        const body = rawBody.slice(0, rawBody.length - 2); // remove trailing CRLF

        if (headersText.includes('name="name"')) {
          name = body.toString().trim();
        } else if (headersText.includes('name="date"')) {
          date = body.toString().trim();
        } else if (headersText.includes('name="type"')) {
          type = body.toString().trim();
        } else if (headersText.includes('name="photo"')) {
          photoBuffer = body;
        } else if (headersText.includes('name="video"')) {
          videoBuffer = body;
        }
      });

      if (!photoBuffer || !videoBuffer) {
        return res.status(400).json({ error: "Missing photo or video" });
      }
      // 2. Upload original photo and video to GridFS
      const photoId = await uploadToGridFS(
        `photo-${Date.now()}.jpg`,
        photoBuffer,
        "image/jpeg"
      );
      const videoId = await uploadToGridFS(
        `video-${Date.now()}.mp4`,
        videoBuffer,
        "video/mp4"
      );

      // 2. Generate poster from scratch
      const posterWidth = 1080; // Standard HD width
      const posterHeight = 1920; // Standard HD height (9:16 aspect ratio)

      const canvas = createCanvas(posterWidth, posterHeight);
      const ctx = canvas.getContext("2d");

      // 1. Create gradient background with more vibrant colors
      const gradient = ctx.createLinearGradient(
        0,
        0,
        posterWidth,
        posterHeight
      );
      gradient.addColorStop(0, "#860808ff"); // Deep purple
      gradient.addColorStop(1, "#e5062bff"); // Bright blue
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, posterWidth, posterHeight);

      // 2. Load and draw the person's photo with elegant frame
      const userPhoto = await loadImage(photoBuffer);

      // Photo dimensions and positioning
      const photoAreaWidth = posterWidth * 0.8;
      const photoAreaHeight = posterHeight * 0.5;
      const photoX = (posterWidth - photoAreaWidth) / 2;
      const photoY = posterHeight * 0.1;

      // Create rounded rectangle clip path with border
      const cornerRadius = 30;
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(photoX + cornerRadius, photoY);
      ctx.lineTo(photoX + photoAreaWidth - cornerRadius, photoY);
      ctx.quadraticCurveTo(
        photoX + photoAreaWidth,
        photoY,
        photoX + photoAreaWidth,
        photoY + cornerRadius
      );
      ctx.lineTo(
        photoX + photoAreaWidth,
        photoY + photoAreaHeight - cornerRadius
      );
      ctx.quadraticCurveTo(
        photoX + photoAreaWidth,
        photoY + photoAreaHeight,
        photoX + photoAreaWidth - cornerRadius,
        photoY + photoAreaHeight
      );
      ctx.lineTo(photoX + cornerRadius, photoY + photoAreaHeight);
      ctx.quadraticCurveTo(
        photoX,
        photoY + photoAreaHeight,
        photoX,
        photoY + photoAreaHeight - cornerRadius
      );
      ctx.lineTo(photoX, photoY + cornerRadius);
      ctx.quadraticCurveTo(photoX, photoY, photoX + cornerRadius, photoY);
      ctx.closePath();
      ctx.clip();

      // Draw the photo with object-fit: cover behavior
      const photoAspect = userPhoto.width / userPhoto.height;
      const areaAspect = photoAreaWidth / photoAreaHeight;

      let drawWidth, drawHeight, offsetX, offsetY;

      if (photoAspect > areaAspect) {
        // Photo is wider than area - scale to height
        drawHeight = photoAreaHeight;
        drawWidth = drawHeight * photoAspect;
        offsetX = (photoAreaWidth - drawWidth) / 2;
        offsetY = 0;
      } else {
        // Photo is taller than area - scale to width
        drawWidth = photoAreaWidth;
        drawHeight = drawWidth / photoAspect;
        offsetX = 0;
        offsetY = (photoAreaHeight - drawHeight) / 2;
      }

      ctx.drawImage(
        userPhoto,
        0,
        0,
        userPhoto.width,
        userPhoto.height,
        photoX + offsetX,
        photoY + offsetY,
        drawWidth,
        drawHeight
      );

      // Add border
      ctx.restore();
      ctx.beginPath();
      ctx.moveTo(photoX + cornerRadius, photoY);
      ctx.lineTo(photoX + photoAreaWidth - cornerRadius, photoY);
      ctx.quadraticCurveTo(
        photoX + photoAreaWidth,
        photoY,
        photoX + photoAreaWidth,
        photoY + cornerRadius
      );
      ctx.lineTo(
        photoX + photoAreaWidth,
        photoY + photoAreaHeight - cornerRadius
      );
      ctx.quadraticCurveTo(
        photoX + photoAreaWidth,
        photoY + photoAreaHeight,
        photoX + photoAreaWidth - cornerRadius,
        photoY + photoAreaHeight
      );
      ctx.lineTo(photoX + cornerRadius, photoY + photoAreaHeight);
      ctx.quadraticCurveTo(
        photoX,
        photoY + photoAreaHeight,
        photoX,
        photoY + photoAreaHeight - cornerRadius
      );
      ctx.lineTo(photoX, photoY + cornerRadius);
      ctx.quadraticCurveTo(photoX, photoY, photoX + cornerRadius, photoY);
      ctx.closePath();
      ctx.lineWidth = 8;
      ctx.strokeStyle = "rgba(255, 255, 255, 0.8)";
      ctx.stroke();

      // 3. Add decorative elements (modern dots pattern)
      ctx.fillStyle = "rgba(255, 255, 255, 0.15)";
      const dotSize = 8;
      const dotSpacing = 30;
      for (let x = 0; x < posterWidth; x += dotSpacing) {
        for (let y = 0; y < posterHeight; y += dotSpacing) {
          // Skip dots where the photo is
          if (
            x < photoX ||
            x > photoX + photoAreaWidth ||
            y < photoY ||
            y > photoY + photoAreaHeight
          ) {
            ctx.beginPath();
            ctx.arc(x, y, dotSize, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }

      // 4. Add text with elegant styling
      ctx.textAlign = "center";
      ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
      ctx.shadowBlur = 10;
      // // AI-generated greeting
      //   const message = await generateBirthdayMessage(name);
      // Main title
      ctx.fillStyle = "#ffffff";
      ctx.font = 'bold 72px "Arial", sans-serif';
      ctx.fillText(
        "Happy Birthday",
        posterWidth / 2,
        photoY + photoAreaHeight + 100
      );
      // ctx.font = '36px Arial';
      //   ctx.fillStyle = '#ffffff';
      //   ctx.fillText(message, posterWidth / 2, photoY + photoHeight + 320);
      // Person's name with gradient
      const nameGradient = ctx.createLinearGradient(0, 0, posterWidth, 0);
      nameGradient.addColorStop(0, "#ece1d4ff");
      nameGradient.addColorStop(1, "#dfc7d0ff");
      ctx.fillStyle = nameGradient;
      ctx.font = 'bold 96px "Arial", sans-serif';
      ctx.fillText(
        name.toUpperCase(),
        posterWidth / 2,
        photoY + photoAreaHeight + 220
      );

      // Date with subtle styling
      function formatDateToDayMonth(dateStr) {
        const dateObj = new Date(dateStr);

        const day = dateObj.getDate();
        const month = dateObj.toLocaleString("default", { month: "long" });
        const suffix =
          day % 10 === 1 && day !== 11
            ? "st"
            : day % 10 === 2 && day !== 12
              ? "nd"
              : day % 10 === 3 && day !== 13
                ? "rd"
                : "th";

        return `${day}${suffix} ${month}`;
      }

      ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
      ctx.font = 'italic 48px "Arial", sans-serif';
      const formattedDate = formatDateToDayMonth(date);
      ctx.fillText(
        formattedDate,
        posterWidth / 2,
        photoY + photoAreaHeight + 300
      );

      // 5. Add decorative elements at bottom
      ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
      for (let i = 0; i < 3; i++) {
        const size = 15 + i * 5;
        const yPos = posterHeight - 80 - i * 40;
        ctx.beginPath();
        ctx.arc(posterWidth * 0.2, yPos, size, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(posterWidth * 0.8, yPos, size, 0, Math.PI * 2);
        ctx.fill();
      }

      // 6. Convert canvas to PNG buffer
      const posterBuffer = canvas.toBuffer("image/png");
      const posterId = await uploadToGridFS(
        `poster-${Date.now()}.png`,
        posterBuffer,
        "image/png"
      );
      // 3. Create poster video (5s) using FFmpeg
      const tempPoster = path.join(os.tmpdir(), `poster-${Date.now()}.png`);
      await fs.writeFile(tempPoster, posterBuffer);
      const posterVideoPath = path.join(
        os.tmpdir(),
        `image-video-${Date.now()}.mp4`
      );

      await new Promise((resolve, reject) => {
        ffmpeg(tempPoster)
          .loop(1)
          .fps(25)
          .videoCodec("libx264")
          .outputOptions("-pix_fmt yuv420p")
          .size("2160x4096")
          .duration(5)
          .save(posterVideoPath)
          .on("end", resolve)
          .on("error", reject);
      });

      const posterVideoBuffer = await fs.readFile(posterVideoPath);
      const posterVideoId = await uploadToGridFS(
        `image-video-${Date.now()}.mp4`,
        posterVideoBuffer,
        "video/mp4"
      );

      // 4. Merge videos (poster video + user video)
      const tempOriginalVideo = path.join(
        os.tmpdir(),
        `video-${Date.now()}.mp4`
      );
      await fs.writeFile(tempOriginalVideo, videoBuffer);
      // Get original video resolution
      const { width, height, fps } = await getVideoMetadata(tempOriginalVideo);
      const mergedVideoPath = path.join(
        os.tmpdir(),
        `merged-${Date.now()}.mp4`
      );

      await new Promise((resolve, reject) => {
        ffmpeg()
          .input(tempOriginalVideo)
          .input(posterVideoPath)
          .complexFilter([
            // Scale both videos to 1080x1920 with padding and aspect ratio preservation
            "[0:v]scale=1080:1920:force_original_aspect_ratio=decrease,pad=1080:1920:(ow-iw)/2:(oh-ih)/2,setsar=1[v0]",
            "[1:v]scale=1080:1920:force_original_aspect_ratio=decrease,pad=1080:1920:(ow-iw)/2:(oh-ih)/2,setsar=1[v1]",
            "[v0][v1]concat=n=2:v=1:a=0[outv]",
          ])
          .outputOptions([
            "-map",
            "[outv]",
            "-c:v",
            "libx264",
            "-pix_fmt",
            "yuv420p",
            "-r",
            "25", // force consistent FPS
          ])
          // .on("start", (cmdLine) =>
          //   console.log("FFmpeg Merge Command:", cmdLine)
          // )
          .save(mergedVideoPath)
          .on("end", resolve)
          .on("error", (err) => {
            console.error("FFmpeg Merge Error:", err);
            reject(err);
          });
      });

      const mergedVideoBuffer = await fs.readFile(mergedVideoPath);
      const mergedVideoId = await uploadToGridFS(
        `merged-${Date.now()}.mp4`,
        mergedVideoBuffer,
        "video/mp4"
      );
      const _id = new mongoose.Types.ObjectId();
      // 5. Save in MongoDB
      const media = new Media({
        _id,
        name,
        date,
        type,
        photoId,
        videoId,
        posterId,
        posterVideoId,
        mergedVideoId,
        whatsappstatus,
        createdAt: new Date(),
      });

      const downloadUrl = `https://api.bilimbebrandactivations.com/api/upload/file/${media.mergedVideoId}?download=true`;
      const qrCodeData = await QRCode.toDataURL(downloadUrl);
      media.qrCode = qrCodeData;
      await media.save();
      // ✅ Safely delete all other temporary files
      const tempFiles = [tempOriginalVideo];
      for (const file of tempFiles) {
        if (file) {
          fs.unlink(file).catch(() => { }); // ignore if file is already deleted/missing
        }
      }
      res.status(201).json({ success: true, media });
    });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
});
// photo and gif merge for muthoot
router.post("/photogif", async (req, res) => {
  try {
    const contentType = req.headers["content-type"];
    if (!contentType || !contentType.includes("multipart/form-data")) {
      return res.status(400).json({ error: "Invalid content type" });
    }

    const boundary = "--" + contentType.split("boundary=")[1];
    let chunks = [];
    req.on("data", (chunk) => {
      chunks.push(chunk);
    });

    req.on("end", async () => {
      const buffer = Buffer.concat(chunks);
      const boundaryBuffer = Buffer.from(boundary);

      const parts = splitBuffer(buffer, boundaryBuffer).slice(1, -1); // remove first/last boundary markers
      let name, date, type;
      let photoBuffer, gifBuffer;
      const whatsappstatus = "pending";
      // Split by boundary, keep binary intact

      parts.forEach((part) => {
        const [rawHeaders, rawBody] = splitBuffer(
          part,
          Buffer.from("\r\n\r\n")
        );
        const headersText = rawHeaders.toString();
        const body = rawBody.slice(0, rawBody.length - 2); // remove trailing CRLF

        if (headersText.includes('name="name"')) {
          name = body.toString().trim();
        } else if (headersText.includes('name="date"')) {
          date = body.toString().trim();
        } else if (headersText.includes('name="type"')) {
          type = body.toString().trim();
        } else if (headersText.includes('name="photo"')) {
          photoBuffer = body;
        } else if (headersText.includes('name="gif"')) {
          gifBuffer = body;
        }
      });

      if (!photoBuffer || !gifBuffer) {
        return res.status(400).json({ error: "Missing audio or video" });
      }
      // 1. Upload photo and gif to GridFS
      // 2. Upload original photo and video to GridFS
      const photoId = await uploadToGridFS(
        `photogif-${Date.now()}.png`,
        photoBuffer,
        "image/png"
      );
      const gifId = await uploadToGridFS(
        `gif-${Date.now()}.gif`,
        gifBuffer,
        "gif/gif"
      );
      // 2. Save photo and gif temporarily
      const tempPhotoPath = await saveTempFile(photoBuffer, "jpg");
      const tempGifPath = await saveTempFile(gifBuffer, "gif");

      // 3. Generate unique output path
      const posterVideoPath = path.join(
        os.tmpdir(),
        `image-gif-video-${Date.now()}.mp4`
      );
      // get audio
      const coinAudioPath = path.join(
        __dirname,
        "..",
        "assets",
        "ganeshchat.mp3"
      );
      // or temp path if from upload
      const logovideoPath = path.join(
        __dirname,
        "..",
        "assets",
        "muthootlogo.mp4"
      );
      // 🔢 Adjust these to position GIF in the hand
      const overlayX = 0;
      const overlayY = 0;
      // 4. Run FFmpeg to generate the poster video
      await new Promise((resolve, reject) => {
        ffmpeg()
          .input(tempPhotoPath) // 0:v - background
          .inputOptions("-loop 1") // loop background photo
          .input(tempGifPath)
          .inputOptions("-stream_loop -1") // 1:v - gif
          .input(coinAudioPath) // 2:a - audio
          .inputOptions("-stream_loop -1") // loop audio
          .input(logovideoPath)
          .complexFilter([
            "[0:v]scale=1080:1920,setsar=1[bg]",
            "[1:v]scale=1080:1920:flags=lanczos,format=rgba[gif]",
            `[bg][gif]overlay=${overlayX}:${overlayY}:shortest=1[overlayed]`,
            "[3:v]scale=1080:1920,setpts=PTS-STARTPTS+5/TB[secondVid]",

            "[overlayed][secondVid]overlay=0:0:enable='gte(t,5)'[v]",
          ])
          // .complexFilter([
          //   "[0:v]scale=1080:1920:force_original_aspect_ratio=decrease,pad=1080:1920:(ow-iw)/2:(oh-ih)/2,setsar=1[bg]",
          //   "[1:v]fps=15,scale=1080:1920:-1:flags=lanczos[gif_scaled]", // Scale GIF without distortion
          //   "[bg][gif_scaled]overlay=0:0:format=auto[with_gif]",
          //   {
          //     filter: "drawtext",
          //     options: {
          //       fontfile: "/Windows/Fonts/arialbd.ttf",
          //       text: "Muthoot Finance\nwishes you a\nHappy Ganesh Chaturthi",
          //       fontcolor: "#a00808ff", // Gold
          //       fontsize: "min(w/15, 80)",
          //       line_spacing: 25,
          //       shadowcolor: "#8B0000@0.7", // Dark red shadow
          //       shadowx: 4,
          //       shadowy: 4,
          //       box: 1,
          //       boxcolor: "white@0.9", // Maroon background
          //       boxborderw: 100,
          //       bordercolor: "#f25858ff", // Gold border
          //       borderw: 5,
          //       x: "(w-text_w)/2",
          //       y: "(h-text_h-line_h)/2", // Higher position
          //       enable: "between(t,5,10)",
          //       alpha: "if(lt(t,5),1, if(lt(t,10),(10-t)/1, 0))",
          //       fix_bounds: 1,
          //     },
          //     inputs: "with_gif",
          //     outputs: "v",
          //     fix_bounds: 1,
          //     wrap: 1,
          //   },
          // ])
          .audioFilters([
            "volume=0.5", // reduce volume to 50%
            "afade=t=out:st=10:d=1", // fade out at end
          ])
          .outputOptions([
            "-map [v]",
            "-map 2:a",
            "-t 10", // 10 seconds
            "-r 25",
            "-pix_fmt yuv420p",
            "-c:v libx264",
            "-c:a aac", // ensures it ends at 10s, not earlier
          ])

          // .on("start", (cmd) => console.log("FFmpeg command:", cmd))
          .on("end", resolve)
          .on("error", (err) => {
            console.error("FFmpeg error:", err);
            reject(err);
          })
          .save(posterVideoPath);
      });

      // 5. Upload the generated video to GridFS
      const posterVideoBuffer = await fs.readFile(posterVideoPath);
      const posterVideoId = await uploadToGridFS(
        `poster-${Date.now()}.mp4`,
        posterVideoBuffer,
        "video/mp4"
      );

      // 6. Save metadata to MongoDB
      const _id = new mongoose.Types.ObjectId();
      const media = new Media({
        _id,
        name,
        date,
        type,
        photoId,
        gifId,
        posterVideoId,
        whatsappstatus,
        createdAt: new Date(),
      });
      const downloadUrl = `https://api.bilimbebrandactivations.com/api/upload/file/${media.posterVideoId}?download=true`;
      const qrCodeData = await QRCode.toDataURL(downloadUrl);
      media.qrCode = qrCodeData;
      await media.save();
      const tempFiles = [tempGifPath];
      for (const file of tempFiles) {
        if (file) {
          fs.unlink(file).catch(() => { }); // ignore if file is already deleted/missing
        }
      }
      res.status(201).json({ success: true, media });
    });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
});
const getStreamInfo = (filePath) => {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(filePath, (err, metadata) => {
      if (err) return reject(err);
      const hasAudio = metadata.streams.some((s) => s.codec_type === "audio");
      const duration = metadata.format.duration;
      resolve({ hasAudio, duration });
    });
  });
};
// video and video merge with audio for marathon event
router.post("/videovideo", async (req, res) => {
  try {
    const contentType = req.headers["content-type"];
    if (!contentType || !contentType.includes("multipart/form-data")) {
      return res.status(400).json({ error: "Invalid content type" });
    }

    const boundary = "--" + contentType.split("boundary=")[1];
    let chunks = [];
    req.on("data", (chunk) => {
      chunks.push(chunk);
    });

    req.on("end", async () => {
      const buffer = Buffer.concat(chunks);
      const boundaryBuffer = Buffer.from(boundary);

      const parts = splitBuffer(buffer, boundaryBuffer).slice(1, -1); // remove first/last boundary markers
      let name, date, type;
      let video1Buffer, video2Buffer, audioBuffer;
      const whatsappstatus = "pending";
      // Split by boundary, keep binary intact

      parts.forEach((part) => {
        const [rawHeaders, rawBody] = splitBuffer(
          part,
          Buffer.from("\r\n\r\n")
        );
        const headersText = rawHeaders.toString();
        const body = rawBody.slice(0, rawBody.length - 2); // remove trailing CRLF

        if (headersText.includes('name="name"')) {
          name = body.toString().trim();
        } else if (headersText.includes('name="date"')) {
          date = body.toString().trim();
        } else if (headersText.includes('name="type"')) {
          type = body.toString().trim();
        } else if (headersText.includes('name="video1"')) {
          video1Buffer = body;
        } else if (headersText.includes('name="video2"')) {
          video2Buffer = body;
        } else if (headersText.includes('name="audio"')) {
          audioBuffer = body;
        }
      });

      if (!video1Buffer || !video2Buffer || !audioBuffer) {
        return res.status(400).json({ error: "Missing audio or video" });
      }
      // 2. Upload original photo and video to GridFS
      const video1Id = await uploadToGridFS(
        `video1-${Date.now()}.mp4`,
        video1Buffer,
        "video/mp4"
      );
      const video2Id = await uploadToGridFS(
        `video2-${Date.now()}.mp4`,
        video2Buffer,
        "video/mp4"
      );
      const audioId = await uploadToGridFS(
        `audio-${Date.now()}.mp4`,
        audioBuffer,
        "audio/mp3"
      );
      // Save temp files
      const tempvideo1Path = await saveTempFile(video1Buffer, "mp4");
      const tempvideo2Path = await saveTempFile(video2Buffer, "mp4");
      const tempAudioPath = await saveTempFile(audioBuffer, "mp3");
      // Output path
      const posterVideoPath = path.join(
        os.tmpdir(),
        `merged-${Date.now()}.mp4`
      );
      await new Promise((resolve, reject) => {
        ffmpeg()
          .input(tempvideo1Path)
          .input(tempvideo2Path)
          // Apply looping ONLY to the audio file
          .input(tempAudioPath)
          .inputOptions(["-stream_loop -1"]) // This now applies to the most recent input
          .complexFilter([
            // Scale both videos
            "[0:v]scale=1080:1920,fps=30,setsar=1[v0]",
            "[1:v]scale=1080:1920,fps=30,setsar=1[v1]",
            // Concatenate only video streams (no audio)
            "[v0][v1]concat=n=2:v=1:a=0[v]",
          ])
          .outputOptions([
            "-map [v]", // take video from concat
            "-map 2:a", // take audio from looping file
            "-c:v libx264",
            "-c:a aac",
            "-pix_fmt yuv420p",
            "-shortest", // stop when video ends
            "-movflags +faststart",
          ])
          //.on("start", (cmd) => console.log("FFmpeg command:", cmd))
          .on("end", resolve)
          .on("error", reject)
          .save(posterVideoPath);
      });

      // Upload merged video to GridFS
      const posterVideoBuffer = await fs.readFile(posterVideoPath);
      const posterVideoId = await uploadToGridFS(
        `merged-${Date.now()}.mp4`,
        posterVideoBuffer,
        "video/mp4"
      );

      // Save metadata
      const _id = new mongoose.Types.ObjectId();
      const media = new Media({
        _id,
        name,
        date,
        type,
        video1Id,
        video2Id,
        posterVideoId: new mongoose.Types.ObjectId(posterVideoId),
        whatsappstatus,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const downloadUrl = `https://api.bilimbebrandactivations.com/api/upload/file/${media.posterVideoId}?download=true`;
      const qrCodeData = await QRCode.toDataURL(downloadUrl);
      media.qrCode = qrCodeData;
      await media.save();
      const tempFiles = [tempAudioPath];
      for (const file of tempFiles) {
        if (file) {
          fs.unlink(file).catch(() => { }); // ignore if file is already deleted/missing
        }
      }
      res.status(201).json({ success: true, media });
    });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
});
//2 videos merge with frame
// router.post(
//   "/videovideo",
//   upload.fields([{ name: "video1" }, { name: "video2" }, { name: "audio" }]),
//   async (req, res) => {
//     try {
//with frame code
//       const { name, date, type } = req.body;
//       const video1File = req.files["video1"][0];
//       const video2File = req.files["video2"][0];
//       const audioFile = req.files["audio"]?.[0];

//       if (!audioFile) {
//         return res.status(400).json({ error: "Audio file is required" });
//       }

//       // Save temp files
//       const tempvideo1Path = await saveTempFile(video1File.buffer, "mp4");
//       const tempvideo2Path = await saveTempFile(video2File.buffer, "mp4");
//       const tempAudioPath = await saveTempFile(audioFile.buffer, "mp3");

//       // Output path
//       const posterVideoPath = path.join(
//         os.tmpdir(),
//         `merged-${Date.now()}.mp4`
//       );
//  const frame = path.join(
//         __dirname,
//         "..",
//         "assets",
//         "runningframe.png"
//       );
//       const overlayX = 0;
//       const overlayY = 0;
//       await new Promise((resolve, reject) => {
//         ffmpeg()
//           .input(tempvideo1Path)
//           .input(tempvideo2Path)
//           .input(frame)
//           .inputOptions("-loop 1")
//           // Apply looping ONLY to the audio file
//           .input(tempAudioPath)
//           .inputOptions(["-stream_loop -1"]) // This now applies to the most recent input
//           .complexFilter([
//             // Scale both videos
//             "[0:v]scale=720:1080,fps=30,setsar=1[v0]",
//             "[1:v]scale=720:1080,fps=30,setsar=1[v1]",
//              // Scale frame image
//       "[2:v]scale=720:1080[framebg]",

//       // Concatenate the videos (video only)
//       "[v0][v1]concat=n=2:v=1:a=0[vid]",

//       // Overlay the frame image on top of concatenated video
//       "[vid][framebg]overlay=0:0:shortest=1[final]"
//           ])
//           .outputOptions([
//             "-map [final]", // take video from concat
//             "-map 3:a", // take audio from looping file
//             "-c:v libx264",
//             "-c:a aac",
//             "-pix_fmt yuv420p",
//             "-shortest", // stop when video ends
//             "-movflags +faststart",
//           ])
//           .on("start", (cmd) => console.log("FFmpeg command:", cmd))
//           .on("end", resolve)
//           .on("error", reject)
//           .save(posterVideoPath);
//       });

//       // Upload merged video to GridFS
//       const posterVideoBuffer = await fs.readFile(posterVideoPath);
//       const posterVideoId = await uploadToGridFS(
//         `merged-${Date.now()}.mp4`,
//         posterVideoBuffer,
//         "video/mp4"
//       );

//       // Save metadata
//       const _id = new mongoose.Types.ObjectId();
//       const media = new Media({
//         _id,
//         name,
//         date,
//         type,
//         video1Id: new mongoose.Types.ObjectId(
//           await uploadToGridFS(
//             video1File.originalname,
//             video1File.buffer,
//             video1File.mimetype
//           )
//         ),
//         video2Id: new mongoose.Types.ObjectId(
//           await uploadToGridFS(
//             video2File.originalname,
//             video2File.buffer,
//             video2File.mimetype
//           )
//         ),
//         posterVideoId: new mongoose.Types.ObjectId(posterVideoId),
//       });


//       const downloadUrl = `https://api.bilimbebrandactivations.com/api/upload/file/${media.posterVideoId}?download=true`;
//       const qrCodeData = await QRCode.toDataURL(downloadUrl);
//  media.qrCode = qrCodeData;
//       await media.save();
//       res.status(201).json({ success: true, media });
//     } catch (error) {
//       console.error("Upload error:", error);
//       res.status(500).json({ success: false, error: "Internal Server Error" });
//     }
//   }
// );

//previous code for 2 videos merged only
// router.post(
//   "/videovideo",
//   upload.fields([{ name: "video1" }, { name: "video2" }]),
//   async (req, res) => {
//     try {
//       const { name, date, type } = req.body;
//       const video1File = req.files["video1"][0];
//       const video2File = req.files["video2"][0];

//       // Upload originals to GridFS
//       const video1Id = await uploadToGridFS(
//         video1File.originalname,
//         video1File.buffer,
//         video1File.mimetype
//       );
//       const video2Id = await uploadToGridFS(
//         video2File.originalname,
//         video2File.buffer,
//         video2File.mimetype
//       );

//       // Save temp copies
//       const tempvideo1Path = await saveTempFile(video1File.buffer, "mp4");
//       const tempvideo2Path = await saveTempFile(video2File.buffer, "mp4");

//       // Get media info
//       const info1 = await getStreamInfo(tempvideo1Path);
//       const info2 = await getStreamInfo(tempvideo2Path);

//       // Output path
//       const posterVideoPath = path.join(os.tmpdir(), `merged-${Date.now()}.mp4`);

//       // Build filter dynamically
//     // Always normalize audio streams
// let filters = [
//   "[0:v]scale=1080:1920,setsar=1[v0]",
//   "[1:v]scale=1080:1920,setsar=1[v1]"
// ];

// if (info1.hasAudio) {
//   filters.push("[0:a]aformat=sample_fmts=fltp:sample_rates=44100:channel_layouts=stereo[a0]");
// } else {
//   filters.push("anullsrc=channel_layout=stereo:sample_rate=44100[a0]");
// }

// if (info2.hasAudio) {
//   filters.push("[1:a]aformat=sample_fmts=fltp:sample_rates=44100:channel_layouts=stereo[a1]");
// } else {
//   filters.push("anullsrc=channel_layout=stereo:sample_rate=44100[a1]");
// }

// // Always concat with audio
// filters.push("[v0][a0][v1][a1]concat=n=2:v=1:a=1[v][a]");

// const outputOptions = [
//   "-map [v]",
//   "-map [a]",
//   "-pix_fmt yuv420p",
//   "-c:v libx264",
//   "-c:a aac"
// ];
//       // Run FFmpeg
//       await new Promise((resolve, reject) => {
//         ffmpeg()
//           .input(tempvideo1Path)
//           .input(tempvideo2Path)
//           .complexFilter(filters)
//           .outputOptions(outputOptions)
//           .on("start", (cmd) => console.log("FFmpeg command:", cmd))
//           .on("end", resolve)
//           .on("error", (err) => {
//             console.error("FFmpeg error:", err);
//             reject(err);
//           })
//           .save(posterVideoPath);
//       });

//       // Upload merged video
//       const posterVideoBuffer = await fs.readFile(posterVideoPath);
//       const posterVideoId = await uploadToGridFS(
//         `merged-${Date.now()}.mp4`,
//         posterVideoBuffer,
//         "video/mp4"
//       );

//       // Save metadata
//       const _id = new mongoose.Types.ObjectId();
//       const media = new Media({
//         _id,
//         name,
//         date,
//         type,
//         video1Id: mongoose.isValidObjectId(video1Id)
//           ? new mongoose.Types.ObjectId(video1Id)
//           : video1Id,
//         video2Id: mongoose.isValidObjectId(video2Id)
//           ? new mongoose.Types.ObjectId(video2Id)
//           : video2Id,
//         posterVideoId: mongoose.isValidObjectId(posterVideoId)
//           ? new mongoose.Types.ObjectId(posterVideoId)
//           : posterVideoId,
//       });

//       await media.save();

//       res.json({ success: true, media });
//     } catch (error) {
//       console.error("Upload error:", error);
//       res.status(500).json({ success: false, error: "Internal Server Error" });
//     }
//   }
// );

//previous code for 2 videos only with audio filter
// router.post(
//   "/videovideo",
//   upload.fields([{ name: "video1" }, { name: "video2" }]),
//   async (req, res) => {
//     try {
//       const { name, date, type } = req.body;
//       const video1File = req.files["video1"][0];
//       const video2File = req.files["video2"][0];
//       // 1. Upload video and video to GridFS
//       const video1Id = await uploadToGridFS(
//         video1File.originalname,
//         video1File.buffer,
//         video1File.mimetype
//       );
//       const video2Id = await uploadToGridFS(
//         video2File.originalname,
//         video2File.buffer,
//         video2File.mimetype
//       );

//       // 2. Save photo and gif temporarily
//       const tempvideo1Path = await saveTempFile(video1File.buffer, "mp4");
//       const tempvideo2Path = await saveTempFile(video2File.buffer, "mp4");
//       // Get durations
//       const info1 = await getStreamInfo(tempvideo1Path);
//       const info2 = await getStreamInfo(tempvideo2Path);
//       // 3. Generate unique output path
//       const posterVideoPath = path.join(
//         os.tmpdir(),
//         `merged-${Date.now()}.mp4`
//       );
//       // 4. Run FFmpeg to generate the merged video safely
//       await new Promise((resolve, reject) => {
//         const ffmpegCommand = ffmpeg()
//           .input(tempvideo1Path)
//           .input(tempvideo2Path);
//         let filterGraph = [];
//         const hasAudio1 = info1.hasAudio;
//         const hasAudio2 = info2.hasAudio;

//         // Video scaling & FPS
//         filterGraph.push("[0:v]scale=1080:1920,fps=30,setsar=1[v0]");
//         filterGraph.push("[1:v]scale=1080:1920,fps=30,setsar=1[v1]");

//         // Handle audio streams safely
//         if (hasAudio1 && hasAudio2) {
//           filterGraph.push("[0:a]aformat=channel_layouts=stereo[a0]");
//           filterGraph.push("[1:a]aformat=channel_layouts=stereo[a1]");
//           filterGraph.push("[v0][a0][v1][a1]concat=n=2:v=1:a=1[v][a]");
//         } else if (!hasAudio1 && !hasAudio2) {
//           filterGraph.push("[v0][v1]concat=n=2:v=1:a=0[v]");
//         } else {
//           if (!hasAudio1) {
//             filterGraph.push("anullsrc=r=44100:cl=stereo[a0]");
//           } else {
//             filterGraph.push("[0:a]aformat=channel_layouts=stereo[a0]");
//           }
//           if (!hasAudio2) {
//             filterGraph.push("anullsrc=r=44100:cl=stereo[a1]");
//           } else {
//             filterGraph.push("[1:a]aformat=channel_layouts=stereo[a1]");
//           }
//           filterGraph.push("[v0][a0][v1][a1]concat=n=2:v=1:a=1[v][a]");
//         }
//         ffmpegCommand
//           .complexFilter(filterGraph)
//           .outputOptions([
//             "-map [v]",
//             hasAudio1 || hasAudio2 ? "-map [a]" : "-an",
//             "-pix_fmt yuv420p",
//             "-c:v libx264",
//             "-c:a aac",
//             "-movflags +faststart",
//           ])
//           .on("start", (cmd) => console.log("FFmpeg command:", cmd))
//           .on("end", resolve)
//           .on("error", (err) => {
//             console.error("FFmpeg error:", err);
//             reject(err);
//           })
//           .save(posterVideoPath);
//       });
//       // 5. Upload the generated video to GridFS
//       const posterVideoBuffer = await fs.readFile(posterVideoPath);
//       const posterVideoId = await uploadToGridFS(
//         `merged-${Date.now()}.mp4`,
//         posterVideoBuffer,
//         "video/mp4"
//       );

//       // 6. Save metadata to MongoDB
//       const _id = new mongoose.Types.ObjectId();
//       const media = new Media({
//         _id,
//         name,
//         date,
//         type,
//         video1Id: mongoose.isValidObjectId(video1Id)
//           ? new mongoose.Types.ObjectId(video1Id)
//           : video1Id,
//         video2Id: mongoose.isValidObjectId(video2Id)
//           ? new mongoose.Types.ObjectId(video2Id)
//           : video2Id,
//         posterVideoId: mongoose.isValidObjectId(posterVideoId)
//           ? new mongoose.Types.ObjectId(posterVideoId)
//           : posterVideoId,
//       });

//       // Create a download URL for the posterVideoId
//       const downloadUrl = `https://api.bilimbebrandactivations.com/api/upload/file/${media?.posterVideoId}?download=true`;
//       // Generate QR code as base64
//       const qrCodeData = await QRCode.toDataURL(downloadUrl);
//  media.qrCode = qrCodeData;
//       await media.save();
//       // Send response with media and QR code
//       res.status(201).json({
//         success: true,
//         media,
//       });
//       // res.json({ success: true, media });
//     } catch (error) {
//       console.error("Upload error:", error);
//       res.status(500).json({ success: false, error: "Internal Server Error" });
//     }
//   }
// );
module.exports = router;
