// const express = require("express");
// const AdminSettings = require("../models/AdminSettings.js");
// const Media = require("../models/Media.js");
// const { Readable } = require("stream");
// const runFaceSwap = require("../utils/faceSwap.js");
// const { mergeTwoVideos } = require("../utils/videoMerge.js"); // refactored from your /videovideo route
// const mongoose = require("mongoose");
// const QRCode = require("qrcode");
// const path = require("path");
// const fs = require("fs");
// const os = require("os");
// const axios = require("axios");
// const { getConnection } = require("../InitDB");
// const router = express.Router();
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
const { Readable } = require("stream");
const runFaceSwap = require("../utils/faceSwap.js");
const { mergeTwoVideos } = require("../utils/videoMerge.js"); // refactored from your /videovideo route
const mongoose = require("mongoose");
const QRCode = require("qrcode");
const path = require("path");
const fs = require("fs");
const os = require("os");
const axios = require("axios");
const { getConnection } = require("../InitDB");
const router = express.Router();
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
        // Background processing
        // (async () => {
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

          const media = new Media({
            _id: new mongoose.Types.ObjectId(),
            name: clientName,
            email,
            template_name,
            posterVideoId: clientphotoId,
            source,
            whatsapp,
            whatsappstatus: "pending",
            createdAt: new Date(),
            adminid,
            branchName,
          });
          await media.save();
          res.status(202).json({
            media,
            // message: "Upload received. Processing in background.",
            // clientName,
          });
        } catch (err) {
          console.error("Background processing error:", err);
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
