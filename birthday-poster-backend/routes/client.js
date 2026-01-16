// First router section - commented out, using second router below
// const express = require("express");
// const AdminSettings = require("../models/AdminSettings.js");
// const Media = require("../models/Media.js");
// const ActivityHistory = require("../models/ActivityHistory.js");
// const { Readable } = require("stream");
// const runFaceSwap = require("../utils/faceSwap.js");
// const { mergeTwoVideos } = require("../utils/videoMerge.js");
// const mongoose = require("mongoose");
// const QRCode = require("qrcode");
// const path = require("path");
// const fs = require("fs");
// const os = require("os");
// const axios = require("axios");
// const { getConnection } = require("../InitDB");
// const router = express.Router();

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
// const shareOuput = async (whatsapp, downloadUrl, id, res) => {
//   try {
//     const toNumber = whatsapp;
//     const _id = id;
//     const linksend = downloadUrl;
//     const token = process.env.CHATMYBOT_TOKEN;
//     if (!toNumber || !linksend || !_id) {
//       throw new Error("Phone, link, and _id are required");
//     }
//     if (!mongoose.Types.ObjectId.isValid(_id)) {
//       throw new Error("Invalid media ID");
//     }
//     if (!token) {
//       throw new Error("ChatMyBot token not configured");
//     }
//     const payload = [
//       {
//         to: toNumber,
//         type: "template",
//         template: {
//           id: process.env.WHATSAPP_TEMPLATE_ID,
//           language: {
//             code: "en",
//           },
//           components: [
//             {
//               type: "body",
//               parameters: [
//                 {
//                   type: "text",
//                   text: linksend,
//                 },
//               ],
//             },
//           ],
//         },
//       },
//     ];
//     // Send to ChatMyBot API
//     const response = await axios.post(
//       `https://wa.chatmybot.in/gateway/wabuissness/v1/message/batchapi`,
//       payload,
//       {
//         headers: {
//           "Content-Type": "application/json",
//           accessToken: token,
//         },
//       }
//     );
//     if (response.status !== 200) {
//       return {
//         success: false,
//         message: error.message || "Failed to send message via ChatMyBot",
//       };
//     }
//     //Update media status if API call succeeded
//     const updatedMedia = await Media.findByIdAndUpdate(
//       _id,
//       { whatsappstatus: "yes" },
//       { new: true }
//     );

//     return { success: true, data: updatedMedia };
//   } catch (err) {
//     console.error("Server error in /share:", err.response?.data || err.message);
//     return {
//       success: false,
//       message: err.message || "Internal server error",
//     };
//   }
// };
// async function uploadToGridFS(filename, buffer, contentType) {
//   const { bucket } = getConnection();
//   return new Promise((resolve, reject) => {
//     const uploadStream = bucket.openUploadStream(filename, { contentType });
//     Readable.from(buffer)
//       .pipe(uploadStream)
//       .on("error", reject)
//       .on("finish", () => resolve(uploadStream.id));
//   });
// }
// // split buffer file function
// function splitBuffer(buffer, separator) {
//   let parts = [];
//   let start = 0;
//   let index;
//   while ((index = buffer.indexOf(separator, start)) !== -1) {
//     parts.push(buffer.slice(start, index));
//     start = index + separator.length;
//   }
//   parts.push(buffer.slice(start));
//   return parts;
// }
// const saveTempFile = async (buffer, extension) => {
//   if (!buffer) {
//     throw new Error("saveTempFile: buffer is undefined or empty");
//   }

//   const tempFilePath = path.join(
//     os.tmpdir(),
//     `${Date.now()}-${Math.random().toString(36).slice(2)}.${extension}`
//   );
//   await fs.writeFile(tempFilePath, buffer, (err) => {
//     if (err) {
//       console.error("Error saving file:", err);
//       return;
//     }
//   });

//   return tempFilePath;
// };
// router.post("/client-upload", async (req, res) => {
//   try {
//     let clientID;
//     let whatsapp;
//     let posterVideoId;
//     let tempclientphotoPath;
//     let EventId;
//     let gender;
//     let clientName; // NEW: For videovideovideo type
//     const clientPhoto = req.files?.photo;
//     const contentType = req.headers["content-type"];
//     if (!contentType || !contentType.includes("multipart/form-data")) {
//       return res.status(400).json({ error: "Invalid content type" });
//     }

//     const boundary = "--" + contentType.split("boundary=")[1];
//     let chunks = [];
//     req.on("data", (chunk) => {
//       chunks.push(chunk);
//     });

//     req.on("end", async () => {
//       try {
//         const buffer = Buffer.concat(chunks);
//         const boundaryBuffer = Buffer.from(boundary);

//         const parts = splitBuffer(buffer, boundaryBuffer).slice(1, -1); // remove first/last boundary markers
//         let photoBuffer;
//         // Split by boundary, keep binary intact

//         parts.forEach((part) => {
//           const [rawHeaders, rawBody] = splitBuffer(
//             part,
//             Buffer.from("\r\n\r\n")
//           );
//           const headersText = rawHeaders.toString();
//           const body = rawBody.slice(0, rawBody.length - 2); // remove trailing CRLF

//           if (headersText.includes('name="whatsapp"')) {
//             whatsapp = body.toString().trim();
//           } else if (headersText.includes('name="photo"')) {
//             photoBuffer = body;
//           } else if (headersText.includes('name="EventId"')) {
//             EventId = body.toString().trim();
//           } else if (headersText.includes('name="gender"')) {
//             gender = body.toString().trim();
//           } else if (headersText.includes('name="clientName"')) {
//             // NEW
//             clientName = body.toString().trim();
//           }
//         });
//         const settings = await AdminSettings.findOne({ _id: EventId });
//         if (!settings)
//           return res.status(400).json({ error: "No admin settings found" });
//         if (settings.type === "videovideovideo") {
//           if (!clientName || !whatsapp) {
//             return res.status(400).json({
//               success: false,
//               error:
//                 "For videovideovideo type, both name and WhatsApp are required",
//             });
//           }
//           const mergedVideoId = settings.mergedVideoId;
//           if (!mergedVideoId) {
//             return res.status(400).json({
//               success: false,
//               error: "No merged video found in admin settings",
//             });
//           }
//           // 3. Create new media entry with client data
//           const media = new Media({
//             _id: new mongoose.Types.ObjectId(),
//             name: settings.name,
//             clientName: clientName,
//             date: settings.date,
//             type: settings.type,
//             mergedVideoId: mergedVideoId,
//             posterVideoId: mergedVideoId, // Same as merged video
//             whatsapp: whatsapp,
//             whatsappstatus: "pending",
//             clientname: settings.clientname, // From admin settings
//             brandname: settings.brandname, // From admin settings
//             createdAt: new Date(),
//           });

//           // 4. Generate QR code
//           const downloadUrl = `https://api.bilimbebrandactivations.com/api/upload/file/${mergedVideoId}?download=true`;
//           const qrCodeData = await QRCode.toDataURL(downloadUrl);
//           media.qrCode = qrCodeData;

//           // 5. Save to database
//           await media.save();

//           // 6. Send to WhatsApp in background (don't wait for it)
//           shareOuput(whatsapp, downloadUrl, media._id, {
//             json: () => {},
//           }).catch((err) => {
//             console.error("WhatsApp sending error:", err);
//             // Don't fail the request if WhatsApp fails
//           });

//           // 7. Return success response with media data
//           res.json({
//             success: true,
//             message: "Video request processed successfully",
//             media: {
//               _id: media._id,
//               name: media.name,
//               clientName: media.clientName,
//               mergedVideoId: media.mergedVideoId,
//               posterVideoId: media.posterVideoId,
//               whatsapp: media.whatsapp,
//               clientname: media.clientname,
//               brandname: media.brandname,
//               qrCode: media.qrCode,
//               createdAt: media.createdAt,
//             },
//           });
//         }
//         if (gender && !photoBuffer) {
//           return res.status(400).json({ error: "Missing photo or video" });
//         }
//         // ✅ Respond IMMEDIATELY to frontend (fire-and-forget)
//         if (settings.type !== "videovideovideo") {
//           res.status(202).json({
//             message: "Upload received. Processing in background.",
//             clientName: clientName, // Send back for frontend display
//           });
//           // ✅ Continue processing in background
//           (async () => {
//             try {
//               // 1. Get admin settings
//               const settings = await AdminSettings.findOne({ _id: EventId });
//               if (!settings)
//                 return res
//                   .status(400)
//                   .json({ error: "No admin settings found" });

//               // 2. Upload original photo and video to GridFS
//               const clientphotoId = await uploadToGridFS(
//                 `Clientphoto-${Date.now()}.jpg`,
//                 photoBuffer,
//                 "image/jpeg"
//               );
//               clientID = clientphotoId;
//               tempclientphotoPath = await saveTempFile(photoBuffer, "jpg");
//               // 1. Get latest admin settings
//               // const settings = await AdminSettings.findOne({ _id: EventId });
//               // if (!settings)
//               //   return res.status(400).json({ error: "No admin settings found" });
//               let selectedVideoId;
//               if (gender === "Male1") {
//                 selectedVideoId = settings.boyVideoId1;
//               } else if (gender === "Female1") {
//                 selectedVideoId = settings.girlVideoId1;
//               } else if (gender === "Child Male1") {
//                 selectedVideoId = settings.childBoyVideoId1;
//               } else if (gender === "Child Female1") {
//                 selectedVideoId = settings.childGirlVideoId1;
//               } else if (gender === "Male12") {
//                 selectedVideoId = settings.boyVideoId2;
//               } else if (gender === "Female2") {
//                 selectedVideoId = settings.girlVideoId2;
//               } else if (gender === "Child Male2") {
//                 selectedVideoId = settings.childBoyVideoId2;
//               } else if (gender === "Child Female2") {
//                 selectedVideoId = settings.childGirlVideoId2;
//               } else if (gender === "Male3") {
//                 selectedVideoId = settings.boyVideoId3;
//               } else if (gender === "Female3") {
//                 selectedVideoId = settings.girlVideoId3;
//               } else if (gender === "Child Male3") {
//                 selectedVideoId = settings.childBoyVideoId3;
//               } else if (gender === "Child Female3") {
//                 selectedVideoId = settings.childGirlVideoId3;
//               } else if (gender === "Male4") {
//                 selectedVideoId = settings.boyVideoId4;
//               } else if (gender === "Female4") {
//                 selectedVideoId = settings.girlVideoId4;
//               } else if (gender === "Child Male4") {
//                 selectedVideoId = settings.childBoyVideoId4;
//               } else if (gender === "Child Female4") {
//                 selectedVideoId = settings.childGirlVideoId4;
//               } else {
//                 selectedVideoId = settings.video1Id; // fallback / default
//               }
//               if (settings.faceSwap && !settings.videosMergeOption) {
//                 posterVideoId = await runFaceSwap(
//                   tempclientphotoPath,
//                   selectedVideoId
//                 );
//               } else if (
//                 settings.videosMergeOption &&
//                 settings.video2Id &&
//                 !settings.faceSwap
//               ) {
//                 // 2. Call video merge util with admin's stored files
//                 posterVideoId = await mergeTwoVideos({
//                   name: settings.name,
//                   date: settings.date,
//                   type: settings.type,
//                   video1Id: settings.video1Id,
//                   video2Id: settings.video2Id,
//                   audioId: settings.audioId,
//                   clientPhotoId: clientID,
//                   //clientPhoto: processedPhotoPath || clientPhoto.tempFilePath,
//                 });
//               } else if (settings.videosMergeOption && settings.faceSwap) {
//                 faceswapVideoId = await runFaceSwap(
//                   tempclientphotoPath,
//                   selectedVideoId
//                 );
//                 posterVideoId = await mergeTwoVideos({
//                   name: settings.name,
//                   date: settings.date,
//                   type: settings.type,
//                   video1Id: faceswapVideoId,
//                   video2Id: settings.video2Id,
//                   audioId: settings.audioId,
//                   clientPhotoId: clientID,
//                   //clientPhoto: processedPhotoPath || clientPhoto.tempFilePath,
//                 });
//               }
//               // 3. Save client request
//               const media = new Media({
//                 _id: new mongoose.Types.ObjectId(),
//                 name: settings.name,
//                 date: settings.date,
//                 type: settings.type,
//                 video1Id: settings.video1Id,
//                 video2Id: settings.video2Id,
//                 posterVideoId: posterVideoId,
//                 whatsapp,
//                 whatsappstatus: "pending",
//               });
//               const downloadUrl = `https://api.bilimbebrandactivations.com/api/upload/file/${media.posterVideoId}?download=true`;
//               const qrCodeData = await QRCode.toDataURL(downloadUrl);
//               media.qrCode = qrCodeData;
//               await media.save();
//               await shareOuput(whatsapp, downloadUrl, media._id, {
//                 json: () => {},
//               });
//               //res.json({ success: true, media });
//             } catch (err) {
//               console.error("Background processing error:", err);
//             }
//           })();
//         }
//       } catch (err) {
//         console.error("Client upload error (inside end):", err);
//         //res.status(500).json({ success: false, error: err.message });
//       }
//     });
//   } catch (err) {
//     console.error("Client upload error:", err);
//     res.status(500).json({ success: false, error: err.message });
//   }
// });
// function splitBuffer2(buffer, delimiter) {
//   const parts = [];
//   let start = 0;
//   let index;

//   while ((index = buffer.indexOf(delimiter, start)) !== -1) {
//     parts.push(buffer.slice(start, index));
//     start = index + delimiter.length;
//   }

//   parts.push(buffer.slice(start));
//   return parts;
// }

// router.post("/client/:temp_name", async (req, res) => {
//   try {
//     let clientName;
//     let email;
//     let whatsapp;
//     let template_name;
//     let source;
//     // let templateId;
//     const clientPhoto = req.files?.photo;
//     const contentType = req.headers["content-type"];
//     if (!contentType || !contentType.includes("multipart/form-data")) {
//       return res.status(400).json({ error: "Invalid content type" });
//     }
//     //const boundary = "--" + contentType.split("boundary=")[1];
//     const boundary = contentType.split("boundary=")[1];
//     const boundaryBuffer = Buffer.from(`--${boundary}`);
//     let chunks = [];
//     req.on("data", (chunk) => {
//       chunks.push(chunk);
//     });

//     req.on("end", async () => {
//       try {
//         const buffer = Buffer.concat(chunks);
//         const boundaryBuffersplitBuffer = Buffer.from(boundary);
//         const parts = (buffer, boundaryBuffer).slice(1, -1); // remove first/last boundary markers
//         let photoBuffer;
//         for (const part of parts) {
//           const headerEnd = part.indexOf(Buffer.from("\r\n\r\n"));
//           if (headerEnd === -1) continue;

//           const rawHeaders = part.slice(0, headerEnd);
//           let body = part.slice(headerEnd + 4);

//           if (body.slice(-2).toString() === "\r\n") {
//             body = body.slice(0, -2);
//           }

//           const headersText = rawHeaders.toString();

//           // if (/name="photo"/i.test(headersText)) {
//           //   photoBuffer = body;
//           // } else
//           if (/name="whatsapp"/i.test(headersText)) {
//             whatsapp = body.toString().trim();
//           } else if (/name="clientName"/i.test(headersText)) {
//             clientName = body.toString().trim();
//           } else if (/name="email"/i.test(headersText)) {
//             email = body.toString().trim();
//           } else if (/name="template_name"/i.test(headersText)) {
//             template_name = body.toString().trim();
//           } else if (/name="source"/i.test(headersText)) {
//             source = body.toString().trim();
//           }
//         }
//         if (!photoBuffer) {
//           return res.status(400).json({ error: "Missing photo" });
//         }
//         console.log("photoBuffer exists:", !!photoBuffer);
//         console.log("photo size:", photoBuffer?.length);
//         if (!whatsapp) {
//           return res.status(400).json({ error: "Missing Whatsapp Number" });
//         }
//         res.status(202).json({
//           message: "Upload received. Processing in background.",
//           clientName: clientName, // Send back for frontend display
//         });
//         // ✅ Continue processing in background
//         (async () => {
//           try {
//             // 1. Get admin settings
//             // const settings = await AdminSettings.findOne({ temp_id: template_name });
//             // if (!settings)
//             //   return res.status(400).json({ error: "No admin settings found" });
//             // 2. Upload original photo and video to GridFS
//             const clientphotoId = await uploadToGridFS(
//               `Clientphoto-${Date.now()}.jpg`,
//               photoBuffer,
//               "image/jpeg"
//             );
//             //  const tempphotoId = await uploadToGridFS(
//             //   `Clientphoto-${Date.now()}.jpg`,
//             //   tempBuffer,
//             //   "image/jpeg"
//             // );
//             clientID = clientphotoId;
//             // templateId = tempphotoId;
//             tempclientphotoPath = await saveTempFile(photoBuffer, "jpg");
//             // 3. Save client request
//             const media = new Media({
//               _id: new mongoose.Types.ObjectId(),
//               name: clientName,
//               // date: settings.date,
//               email: email,
//               template_name: template_name,
//               source: source,
//               posterVideoId: clientphotoId,
//               whatsapp,
//               whatsappstatus: "pending",
//             });
//             // const downloadUrl = `https://api.bilimbebrandactivations.com/api/upload/file/${media.posterVideoId}?download=true`;
//             // const qrCodeData = await QRCode.toDataURL(downloadUrl);
//             // media.qrCode = qrCodeData;
//             await media.save();
//             // await shareOuput(whatsapp, downloadUrl, media._id, {
//             //   json: () => {},
//             // });
//             //res.json({ success: true, media });
//           } catch (err) {
//             console.error("Background processing error:", err);
//           }
//         })();
//       } catch (err) {
//         console.error("Client upload error (inside end):", err);
//         //res.status(500).json({ success: false, error: err.message });
//       }
//     });
//   } catch (err) {
//     console.error("Client upload error:", err);
//     res.status(500).json({ success: false, error: err.message });
//   }
// });
// module.exports = router;
const express = require("express");
const nodemailer = require('nodemailer');
const AdminSettings = require("../models/AdminSettings.js");
const Media = require("../models/Media.js");
const ActivityHistory = require("../models/ActivityHistory.js");
const PhotoMergeTemplate = require("../models/PhotoMergeTemplate.js");
const { Readable } = require("stream");
const runFaceSwap = require("../utils/faceSwap.js");
const { mergeTwoVideos, mergeThreeVideos } = require("../utils/videoMerge.js"); // refactored from your /videovideo route
const mongoose = require("mongoose");
const QRCode = require("qrcode");
const path = require("path");
const fs = require("fs");
const os = require("os");
const axios = require("axios");
const { getConnection } = require("../InitDB");
const ffmpeg = require("fluent-ffmpeg");
const router = express.Router();

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
function imageShareEmailTemplate({ name, viewUrl }) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <title>Your Photo Is Ready</title>
</head>
<body style="margin:0; padding:0; background:#f4f4f4; font-family: Arial, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td align="center" style="padding:30px 15px;">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff; border-radius:10px; overflow:hidden;">

          <!-- Header -->
          <tr>
            <td style="background:#b3152c; padding:20px; color:#fff; text-align:center;">
              <h1 style="margin:0; font-size:24px;">PhotoMerge</h1>
              <p style="margin:5px 0 0; font-size:14px;">Your photo is ready to view</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:30px; text-align:center;">
              <h2 style="margin-bottom:10px;">Hi ${name || "there"} </h2>
              <p style="color:#555; font-size:15px;">
                Your photo has been successfully created.
                Click the button below to view and download it.
              </p>

              <!-- Button -->
              <a
                href="${viewUrl}"
                target="_blank"
                style="
                  display:inline-block;
                  margin-top:20px;
                  background:#25D366;
                  color:#ffffff;
                  padding:14px 28px;
                  text-decoration:none;
                  border-radius:30px;
                  font-size:16px;
                  font-weight:bold;
                "
              >
                View Your Photo
              </a>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f8f8f8; padding:15px; text-align:center; font-size:12px; color:#777;">
               PhotoMerge | All rights reserved | ${new Date().getFullYear()}
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;
}

const shareOuput = async (whatsapp, downloadUrl, id, res) => {
  try {
    const toNumber = whatsapp;
    const _id = id;
    const linksend = downloadUrl;
    const token = process.env.CHATMYBOT_TOKEN;
    if (!toNumber || !linksend || !_id) {
      throw new Error("Phone, link, and _id are required");
    }
    if (!mongoose.Types.ObjectId.isValid(_id)) {
      throw new Error("Invalid media ID");
    }
    if (!token) {
      throw new Error("ChatMyBot token not configured");
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
                  text: linksend,
                },
              ],
            },
          ],
        },
      },
    ];
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
    if (response.status !== 200) {
      return {
        success: false,
        message: error.message || "Failed to send message via ChatMyBot",
      };
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

    return { success: true, data: updatedMedia };
  } catch (err) {
    console.error("Server error in /share:", err.response?.data || err.message);
    return {
      success: false,
      message: err.message || "Internal server error",
    };
  }
};
const shareOuputApp = async (whatsapp, viewUrl, id, name, res) => {
  try {
    const toNumber = whatsapp;
    const _id = id;
    const linksend = viewUrl;
    const userName = name;
    const token = process.env.CHATMYBOT_TOKEN;
    if (!toNumber || !linksend || !_id || !userName) {
      throw new Error("Phone, link,name and _id are required");
    }
    if (!mongoose.Types.ObjectId.isValid(_id)) {
      throw new Error("Invalid media ID");
    }
    if (!token) {
      throw new Error("ChatMyBot token not configured");
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
                  text: linksend,
                },
              ],
            },
          ],
        },
      },
    ];
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
    if (response.status !== 200) {
      return {
        success: false,
        message: error.message || "Failed to send message via ChatMyBot",
      };
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

    return { success: true, data: updatedMedia };
  } catch (err) {
    console.error("Server error in /share:", err.response?.data || err.message);
    return {
      success: false,
      message: err.message || "Internal server error",
    };
  }
};
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
const saveTempFile = async (buffer, extension) => {
  if (!buffer) {
    throw new Error("saveTempFile: buffer is undefined or empty");
  }

  const tempFilePath = path.join(
    os.tmpdir(),
    `${Date.now()}-${Math.random().toString(36).slice(2)}.${extension}`
  );
  await fs.writeFile(tempFilePath, buffer, (err) => {
    if (err) {
      console.error("Error saving file:", err);
      return;
    }
  });

  return tempFilePath;
};
router.post("/client-upload", async (req, res) => {
  try {
    let clientID;
    let whatsapp;
    let posterVideoId;
    let tempclientphotoPath;
    let EventId;
    let gender;
    let clientName; // NEW: For videovideovideo type
    const clientPhoto = req.files?.photo;
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
      try {
        const buffer = Buffer.concat(chunks);
        const boundaryBuffer = Buffer.from(boundary);

        const parts = splitBuffer(buffer, boundaryBuffer).slice(1, -1); // remove first/last boundary markers
        let photoBuffer;
        // Split by boundary, keep binary intact

        parts.forEach((part) => {
          const [rawHeaders, rawBody] = splitBuffer(
            part,
            Buffer.from("\r\n\r\n")
          );
          const headersText = rawHeaders.toString();
          const body = rawBody.slice(0, rawBody.length - 2); // remove trailing CRLF

          if (headersText.includes('name="whatsapp"')) {
            whatsapp = body.toString().trim();
          } else if (headersText.includes('name="photo"')) {
            photoBuffer = body;
          } else if (headersText.includes('name="EventId"')) {
            EventId = body.toString().trim();
          } else if (headersText.includes('name="gender"')) {
            gender = body.toString().trim();
          } else if (headersText.includes('name="clientName"')) {
            // NEW
            clientName = body.toString().trim();
          }
        });
        const settings = await AdminSettings.findOne({ _id: EventId });
        if (!settings)
          return res.status(400).json({ error: "No admin settings found" });
        if (settings.type === "videovideovideo") {
          if (!clientName || !whatsapp) {
            return res.status(400).json({
              success: false,
              error:
                "For videovideovideo type, both name and WhatsApp are required",
            });
          }
          const mergedVideoId = settings.mergedVideoId;
          if (!mergedVideoId) {
            return res.status(400).json({
              success: false,
              error: "No merged video found in admin settings",
            });
          }
          // 3. Create new media entry with client data
          const media = new Media({
            _id: new mongoose.Types.ObjectId(),
            name: settings.name,
            clientName: clientName,
            date: settings.date,
            type: settings.type,
            mergedVideoId: mergedVideoId,
            posterVideoId: mergedVideoId, // Same as merged video
            whatsapp: whatsapp,
            whatsappstatus: "pending",
            clientname: settings.clientname, // From admin settings
            brandname: settings.brandname, // From admin settings
            createdAt: new Date(),
          });

          // 4. Generate QR code
          const downloadUrl = `https://api.bilimbebrandactivations.com/api/upload/file/${mergedVideoId}?download=true`;
          const qrCodeData = await QRCode.toDataURL(downloadUrl);
          media.qrCode = qrCodeData;

          // 5. Save to database
          await media.save();

          // Log activity for video creation
          if (settings.adminid) {
            await logActivity({
              customerPhone: whatsapp || '',
              customerName: clientName || settings.name || 'Unknown',
              customerEmail: '',
              activityType: 'video_created',
              activityDescription: `Created video with template ${settings.type || 'N/A'}`,
              mediaId: media._id,
              templateName: settings.type || '',
              branchName: settings.branchName || '',
              adminid: settings.adminid
            });
          }

          // 6. Send to WhatsApp in background (don't wait for it)
          shareOuput(whatsapp, downloadUrl, media._id, {
            json: () => { },
          }).catch((err) => {
            console.error("WhatsApp sending error:", err);
            // Don't fail the request if WhatsApp fails
          });

          // 7. Return success response with media data
          res.json({
            success: true,
            message: "Video request processed successfully",
            media: {
              _id: media._id,
              name: media.name,
              clientName: media.clientName,
              mergedVideoId: media.mergedVideoId,
              posterVideoId: media.posterVideoId,
              whatsapp: media.whatsapp,
              clientname: media.clientname,
              brandname: media.brandname,
              qrCode: media.qrCode,
              createdAt: media.createdAt,
            },
          });
        }
        if (gender && !photoBuffer) {
          return res.status(400).json({ error: "Missing photo or video" });
        }
        // ? Respond IMMEDIATELY to frontend (fire-and-forget)
        if (settings.type !== "videovideovideo") {
          res.status(202).json({
            message: "Upload received. Processing in background.",
            clientName: clientName, // Send back for frontend display
          });
          // ? Continue processing in background
          (async () => {
            try {
              // 1. Get admin settings
              const settings = await AdminSettings.findOne({ _id: EventId });
              if (!settings)
                return res
                  .status(400)
                  .json({ error: "No admin settings found" });

              // 2. Upload original photo and video to GridFS
              const clientphotoId = await uploadToGridFS(
                `Clientphoto-${Date.now()}.jpg`,
                photoBuffer,
                "image/jpeg"
              );
              clientID = clientphotoId;
              tempclientphotoPath = await saveTempFile(photoBuffer, "jpg");
              // 1. Get latest admin settings
              // const settings = await AdminSettings.findOne({ _id: EventId });
              // if (!settings)
              //   return res.status(400).json({ error: "No admin settings found" });
              let selectedVideoId;
              if (gender === "Male1") {
                selectedVideoId = settings.boyVideoId1;
              } else if (gender === "Female1") {
                selectedVideoId = settings.girlVideoId1;
              } else if (gender === "Child Male1") {
                selectedVideoId = settings.childBoyVideoId1;
              } else if (gender === "Child Female1") {
                selectedVideoId = settings.childGirlVideoId1;
              } else if (gender === "Male12") {
                selectedVideoId = settings.boyVideoId2;
              } else if (gender === "Female2") {
                selectedVideoId = settings.girlVideoId2;
              } else if (gender === "Child Male2") {
                selectedVideoId = settings.childBoyVideoId2;
              } else if (gender === "Child Female2") {
                selectedVideoId = settings.childGirlVideoId2;
              } else if (gender === "Male3") {
                selectedVideoId = settings.boyVideoId3;
              } else if (gender === "Female3") {
                selectedVideoId = settings.girlVideoId3;
              } else if (gender === "Child Male3") {
                selectedVideoId = settings.childBoyVideoId3;
              } else if (gender === "Child Female3") {
                selectedVideoId = settings.childGirlVideoId3;
              } else if (gender === "Male4") {
                selectedVideoId = settings.boyVideoId4;
              } else if (gender === "Female4") {
                selectedVideoId = settings.girlVideoId4;
              } else if (gender === "Child Male4") {
                selectedVideoId = settings.childBoyVideoId4;
              } else if (gender === "Child Female4") {
                selectedVideoId = settings.childGirlVideoId4;
              } else {
                selectedVideoId = settings.video1Id; // fallback / default
              }
              if (settings.faceSwap && !settings.videosMergeOption) {
                posterVideoId = await runFaceSwap(photoBuffer, selectedVideoId);
                if (!posterVideoId) {
                  throw new Error("FaceSwap failed: no output video generated");
                }
              } else if (
                settings.videosMergeOption &&
                settings.video2Id &&
                !settings.faceSwap
              ) {
                // 2. Call video merge util with admin's stored files
                posterVideoId = await mergeTwoVideos({
                  name: settings.name,
                  date: settings.date,
                  type: settings.type,
                  video1Id: settings.video1Id,
                  video2Id: settings.video2Id,
                  audioId: settings.audioId,
                  clientPhotoId: clientID,
                  //clientPhoto: processedPhotoPath || clientPhoto.tempFilePath,
                });
              } else if (settings.videosMergeOption && settings.faceSwap) {
                faceswapVideoId = await runFaceSwap(
                  photoBuffer,
                  selectedVideoId
                );
                posterVideoId = await mergeTwoVideos({
                  name: settings.name,
                  date: settings.date,
                  type: settings.type,
                  video1Id: faceswapVideoId,
                  video2Id: settings.video2Id,
                  audioId: settings.audioId,
                  clientPhotoId: clientID,
                  //clientPhoto: processedPhotoPath || clientPhoto.tempFilePath,
                });
              }
              // 3. Save client request
              const media = new Media({
                _id: new mongoose.Types.ObjectId(),
                name: settings.name,
                date: settings.date,
                type: settings.type,
                video1Id: settings.video1Id,
                video2Id: settings.video2Id,
                posterVideoId: posterVideoId,
                whatsapp,
                whatsappstatus: "pending",
                createdAt: new Date(),
              });
              const downloadUrl = `https://api.bilimbebrandactivations.com/api/upload/file/${media.posterVideoId}?download=true`;
              const qrCodeData = await QRCode.toDataURL(downloadUrl);
              media.qrCode = qrCodeData;
              await media.save();

              // Log activity for video creation
              if (settings.adminid) {
                await logActivity({
                  customerPhone: whatsapp || '',
                  customerName: settings.name || 'Unknown',
                  customerEmail: '',
                  activityType: 'video_created',
                  activityDescription: `Created video with template ${settings.type || 'N/A'}`,
                  mediaId: media._id,
                  templateName: settings.type || '',
                  branchName: settings.branchName || '',
                  adminid: settings.adminid
                });
              }
              await shareOuput(whatsapp, downloadUrl, media._id, {
                json: () => { },
              });
              //res.json({ success: true, media });
            } catch (err) {
              console.error("Background processing error:", err);
            }
          })();
        }
      } catch (err) {
        console.error("Client upload error (inside end):", err);
        //res.status(500).json({ success: false, error: err.message });
      }
    });
  } catch (err) {
    console.error("Client upload error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});
function splitBuffer2(buffer, delimiter) {
  const parts = [];
  let start = 0;
  let index;

  while ((index = buffer.indexOf(delimiter, start)) !== -1) {
    parts.push(buffer.slice(start, index));
    start = index + delimiter.length;
  }

  parts.push(buffer.slice(start));
  return parts;
}
router.post("/client/:temp_name", async (req, res) => {
  // Increase timeout for this route to handle video processing
  req.setTimeout(900000); // 15 minutes
  res.setTimeout(900000); // 15 minutes
  
  try {
    const contentType = req.headers["content-type"];
    if (!contentType || !contentType.includes("multipart/form-data")) {
      return res.status(400).json({ error: "Invalid content type" });
    }

    const boundary = contentType.split("boundary=")[1];
    const chunks = [];
    req.on("data", (chunk) => chunks.push(chunk));
    req.on("end", async () => {
      try {
        const buffer = Buffer.concat(chunks);
        // Split buffer by boundary string
        const rawParts = buffer
          .toString("binary")
          .split(`--${boundary}`)
          .slice(1, -1);

        let photoBuffer = null;
        let clientName = "",
          email = "",
          whatsapp = "",
          template_name = "",
          source = "",
          adminid = "",
          branchName = "";

        for (const rawPart of rawParts) {
          if (!rawPart) continue;

          // Separate headers from body
          const headerEnd = rawPart.indexOf("\r\n\r\n");
          if (headerEnd === -1) continue;

          const headersText = rawPart.slice(0, headerEnd).toString();
          let body = Buffer.from(rawPart.slice(headerEnd + 4), "binary");

          // Remove trailing \r\n
          if (body.slice(-2).toString() === "\r\n") body = body.slice(0, -2);

          if (/name="photo"/i.test(headersText)) {
            photoBuffer = body; // Keep as Buffer
          } else if (/name="whatsapp"/i.test(headersText)) {
            whatsapp = body.toString().trim();
          } else if (/name="clientName"/i.test(headersText)) {
            clientName = body.toString().trim();
          } else if (/name="email"/i.test(headersText)) {
            email = body.toString().trim();
          } else if (/name="template_name"/i.test(headersText)) {
            template_name = body.toString().trim();
          } else if (/name="source"/i.test(headersText)) {
            source = body.toString().trim();
          } else if (/name="adminid"/i.test(headersText)) {
            adminid = body.toString().trim();
          } else if (/name="branchid"/i.test(headersText)) {
            branchName = body.toString().trim();
          }
        }

        console.log(
          "Photo exists:",
          !!photoBuffer,
          "size:",
          photoBuffer?.length
        );

        if (!whatsapp)
          return res.status(400).json({ error: "Missing Whatsapp Number" });

        // Get template by name (temp_name from route parameter)
        const temp_name = req.params.temp_name || template_name;
        const template = await PhotoMergeTemplate.findOne({ 
          templatename: temp_name,
          status: 'active'
        });

        if (!template) {
          return res.status(404).json({ error: "Template not found" });
        }

        // Check if it's a video merge template
        if (template.accessType === 'videomerge') {
          // For video merge, photoBuffer is actually the middle video (video2)
          if (!photoBuffer) {
            return res.status(400).json({ error: "Middle Video (Video 2) is required" });
          }

          try {
            // Send keep-alive headers to prevent connection timeout
            res.setHeader('Connection', 'keep-alive');
            res.setHeader('Keep-Alive', 'timeout=900');
            
            console.log("Starting video merge process...");
            
            // Upload middle video to GridFS
            const video2Id = await uploadToGridFS(
              `video2-${Date.now()}.mp4`,
              photoBuffer,
              "video/mp4"
            );
            console.log("Video2 uploaded:", video2Id);

            // Get template video IDs
            const video1Id = template.video1Id;
            const video3Id = template.video3Id;
            const audioId = template.audioId;
            const gifId = template.gifId;
            const hasAnimation = template.hasAnimation;

            // Validate required template files
            if (!audioId) {
              return res.status(400).json({ error: 'Template audio is missing' });
            }

            if (!video1Id && !video3Id) {
              return res.status(400).json({ error: 'Template must have at least one video (video1 or video3)' });
            }

            // Set source based on template accessType
            const mediaSource = source || (template.accessType === 'videomerge' ? 'video merge app' : 'photo merge app');
            
            // Create media record immediately with processing status
            // This allows us to return quickly and avoid gateway timeout
            const mediaId = new mongoose.Types.ObjectId();
            const media = new Media({
              _id: mediaId,
              name: clientName || template.name || template.templatename,
              email,
              date: template.date || new Date().toISOString(),
              type: template.type || 'template',
              template_name: temp_name,
              video1Id: video1Id,
              video2Id: video2Id,
              video3Id: video3Id,
              audioId: audioId,
              mergedVideoId: null, // Will be set after processing
              posterVideoId: null, // Will be set to final merged video after processing
              gifId: hasAnimation ? gifId : undefined,
              templateId: template._id,
              source: mediaSource,
              whatsapp,
              whatsappstatus: "processing", // Processing status
              adminid: adminid || template.adminid || "",
              branchName: branchName || template.branchid || "",
              createdAt: new Date()
            });
            await media.save();
            console.log("Media record created with ID:", mediaId, "- Processing will continue in background");

            // Return response immediately to avoid gateway timeout
            const mediaResponse = {
              _id: media._id,
              name: media.name,
              email: media.email,
              date: media.date,
              type: media.type,
              template_name: media.template_name,
              video1Id: media.video1Id,
              video2Id: media.video2Id,
              video3Id: media.video3Id,
              audioId: media.audioId,
              mergedVideoId: null,
              posterVideoId: null, // Will be updated when processing completes
              gifId: media.gifId,
              templateId: media.templateId,
              source: media.source,
              whatsapp: media.whatsapp,
              whatsappstatus: "processing",
              adminid: media.adminid,
              branchName: media.branchName,
              createdAt: media.createdAt
            };

            res.status(201).json({
              success: true,
              media: mediaResponse,
              processing: true,
              message: "Video upload received. Processing in progress. Please check back shortly for the final video."
            });

            // Process video merge and animation asynchronously in the background
            (async () => {
              try {
                console.log(`[Background] Starting video merge for media ID: ${mediaId}`);
                
                // Merge videos using mergeThreeVideos
                const mergedVideoId = await mergeThreeVideos({
                  name: clientName || template.name || template.templatename,
                  date: template.date || new Date().toISOString(),
                  type: template.type || 'template',
                  video1Id: video1Id || video2Id,
                  video2Id: video2Id,
                  video3Id: video3Id || video2Id,
                  audioId: audioId,
                  clientname: clientName || template.clientname || '',
                  brandname: template.brandname || '',
                  congratsOption: template.congratsOption === 'true' || template.congratsOption === true || template.congratsOption === '1',
                  video1TextOption: template.video1TextOption === 'true' || template.video1TextOption === true || template.video1TextOption === '1',
                  video2TextOption: template.video2TextOption === 'true' || template.video2TextOption === true || template.video2TextOption === '1',
                  video3TextOption: template.video3TextOption === 'true' || template.video3TextOption === true || template.video3TextOption === '1',
                  clientPhotoId: null
                });
                console.log(`[Background] Videos merged. Merged video ID: ${mergedVideoId}`);

                let finalVideoId = mergedVideoId;

                // If animation is enabled, apply GIF animation to merged video
                if (hasAnimation && gifId) {
                  console.log(`[Background] Applying GIF animation to merged video...`);
                  const { bucket } = getConnection();
                  const getFileFromGridFS = async (fileId) => {
                    return new Promise((resolve, reject) => {
                      const chunks = [];
                      bucket
                        .openDownloadStream(fileId)
                        .on("data", (chunk) => chunks.push(chunk))
                        .on("end", () => resolve(Buffer.concat(chunks)))
                        .on("error", reject);
                    });
                  };

                  const mergedVideoBuffer = await getFileFromGridFS(mergedVideoId);
                  const gifBufferFromGridFS = await getFileFromGridFS(gifId);

                  const saveTempFile = async (buffer, extension) => {
                    const tempFilePath = path.join(
                      os.tmpdir(),
                      `${Date.now()}-${Math.random().toString(36).slice(2)}.${extension}`
                    );
                    await fs.promises.writeFile(tempFilePath, buffer);
                    return tempFilePath;
                  };

                  const tempMergedVideoPath = await saveTempFile(mergedVideoBuffer, "mp4");
                  const tempGifPath = await saveTempFile(gifBufferFromGridFS, "gif");
                  const outputPath = path.join(os.tmpdir(), `animated-${Date.now()}.mp4`);

                  // Apply GIF animation overlay
                  await new Promise((resolve, reject) => {
                    ffmpeg()
                      .input(tempMergedVideoPath)
                      .input(tempGifPath)
                      .inputOptions(["-stream_loop", "-1"])
                      .complexFilter([
                        "[0:v]scale=1080:1920,setsar=1[bg]",
                        "[1:v]scale=1080:1920:flags=lanczos,format=rgba[gif]",
                        "[bg][gif]overlay=0:0:shortest=1[v]"
                      ])
                      .outputOptions([
                        "-map [v]",
                        "-map 0:a",
                        "-c:v libx264",
                        "-c:a aac",
                        "-pix_fmt yuv420p",
                        "-shortest"
                      ])
                      .on("end", resolve)
                      .on("error", (err) => {
                        console.error("FFmpeg animation error:", err);
                        reject(err);
                      })
                      .save(outputPath);
                  });

                  const animatedVideoBuffer = await fs.promises.readFile(outputPath);
                  finalVideoId = await uploadToGridFS(
                    `animated-${Date.now()}.mp4`,
                    animatedVideoBuffer,
                    "video/mp4"
                  );
                  console.log(`[Background] GIF animation applied. Final video ID: ${finalVideoId}`);

                  // Cleanup temp files
                  try {
                    await fs.promises.unlink(tempMergedVideoPath);
                    await fs.promises.unlink(tempGifPath);
                    await fs.promises.unlink(outputPath);
                  } catch (cleanupErr) {
                    console.warn("Failed to cleanup temp files:", cleanupErr);
                  }
                }

                console.log(`[Background] Updating media record with final merged video...`);
                // Update media record with final merged video (with animation if enabled) as posterVideoId
                await Media.findByIdAndUpdate(mediaId, {
                  mergedVideoId: finalVideoId,
                  posterVideoId: finalVideoId, // Set final merged video (with animation if enabled) as posterVideoId
                  whatsappstatus: "pending"
                });
                console.log(`[Background] Media ${mediaId} updated: posterVideoId set to final merged video ${finalVideoId}`);

                // Log activity for video merge creation
                if (adminid || template.adminid) {
                  await logActivity({
                    customerPhone: whatsapp || '',
                    customerName: clientName || 'Unknown',
                    customerEmail: email || '',
                    activityType: 'video_created',
                    activityDescription: `Created video with template ${temp_name || 'N/A'}`,
                    mediaId: mediaId,
                    templateName: temp_name || '',
                    branchName: branchName || '',
                    adminid: adminid || template.adminid
                  });
                }

                console.log(`[Background] Video processing completed for media ID: ${mediaId}`);
              } catch (err) {
                console.error(`[Background] Video merge processing error for media ${mediaId}:`, err);
                // Update media status to failed
                await Media.findByIdAndUpdate(mediaId, {
                  whatsappstatus: "failed"
                });
              }
            })();
          } catch (err) {
            console.error("Video merge processing error:", err);
            res.status(500).json({ error: "Failed to process video merge", message: err.message });
          }
        } else {
          // Original photo merge logic
        try {
          let clientphotoId = null;
          if (photoBuffer) {
            clientphotoId = await uploadToGridFS(
              `Clientphoto-${Date.now()}.jpg`,
              photoBuffer,
              "image/jpeg"
            );
            console.log("Photo uploaded to GridFS:", clientphotoId);
          }

            // Set source based on template accessType, default to what mobile app sends if not provided
            const mediaSource = source || (template.accessType === 'videomerge' ? 'video merge app' : 'photo merge app');

          const media = new Media({
            _id: new mongoose.Types.ObjectId(),
            name: clientName,
            email,
              template_name: temp_name,
            posterVideoId: clientphotoId,
              source: mediaSource,
            whatsapp,
            whatsappstatus: "pending",
            createdAt: new Date(),
            adminid,
            branchName,
          });
          await media.save();

          // Log activity for photo merge creation
          if (adminid) {
            await logActivity({
              customerPhone: whatsapp || '',
              customerName: clientName || 'Unknown',
              customerEmail: email || '',
              activityType: 'photo_created',
                activityDescription: `Created photo with template ${temp_name || 'N/A'}`,
              mediaId: media._id,
                templateName: temp_name || '',
              branchName: branchName || '',
              adminid: adminid
            });
          }

          res.status(202).json({
            media,
          });
        } catch (err) {
          console.error("Background processing error:", err);
            res.status(500).json({ error: "Failed to process photo", message: err.message });
          }
        }
        // })();
      } catch (err) {
        console.error("Client upload error inside end:", err);
      }
    });
  } catch (err) {
    console.error("Client upload error:", err);
    res.status(500).json({ error: err.message });
  }
});
router.post("/client/share/:whatsapp", async (req, res) => {
  try {
    const typeSend = req.body.typeSend
    if (typeSend === "email") {
      const email = req.params.whatsapp;
      const { viewUrl, id, name } = req.body;

      if (!email || !viewUrl || !id) {
        return res.status(400).json({
          success: false,
          error: "Missing required fields",
        });
      }
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: 'developmentbilimbedigital@gmail.com',//Replace with your Gmail 
          pass: 'hyfu fjrs jaob fvrj' // Replace with your Gmail App Password
        }
      });

      const mailOptions = {
        from: '"PhotoMerge" <developmentbilimbedigital@gmail.com>',
        to: email,
        subject: "Your Photo Is Ready - PhotoMerge",
        html: imageShareEmailTemplate({
          name,
          viewUrl,
        }),
      };
      const info = await transporter.sendMail(mailOptions);
      console.log('Contact email sent:', info.response);
      res.status(200).json({
        success: true,
        message: "Shared successfully",
      });
    } else {
      const whatsapp = req.params.whatsapp;
      const { viewUrl, id, name } = req.body;

      if (!whatsapp || !viewUrl || !id) {
        return res.status(400).json({
          success: false,
          error: "Missing required fields",
        });
      }

      await shareOuputApp(whatsapp, viewUrl, id, name, {
        json: () => { },
      });

      res.status(200).json({
        success: true,
        message: "Shared successfully",
      });
    }
  } catch (err) {
    console.error("WhatsApp sending error:", err);
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});

module.exports = router;
