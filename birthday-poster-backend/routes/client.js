const express = require("express");
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
      { whatsappstatus: "yes" },
      { new: true }
    );

    return { success: true, data: updatedMedia };
  } catch (err) {
    console.error("Server error in /share:", err.response?.data || err.message);
    return {
      success: false,
      message: error.message || "Internal server error",
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
          }
        });

        if (!photoBuffer) {
          return res.status(400).json({ error: "Missing photo or video" });
        }
        // ✅ Respond IMMEDIATELY to frontend (fire-and-forget)
        res
          .status(202)
          .json({ message: "Upload received. Processing in background." });
        // ✅ Continue processing in background
        (async () => {
          try {
            // 2. Upload original photo and video to GridFS
            const clientphotoId = await uploadToGridFS(
              `Clientphoto-${Date.now()}.jpg`,
              photoBuffer,
              "image/jpeg"
            );
            clientID = clientphotoId;
            tempclientphotoPath = await saveTempFile(photoBuffer, "jpg");
            // 1. Get latest admin settings
            const settings = await AdminSettings.findOne({ _id: EventId });
            if (!settings)
              return res.status(400).json({ error: "No admin settings found" });
            let selectedVideoId;
            if (gender === "Male") {
              selectedVideoId = settings.boyVideoId;
            } else if (gender === "Female") {
              selectedVideoId = settings.girlVideoId;
            } else if (gender === "Child Male") {
              selectedVideoId = settings.childBoyVideoId;
            } else if (gender === "Child Female") {
              selectedVideoId = settings.childGirlVideoId;
            } else {
              selectedVideoId = settings.video1Id; // fallback / default
            }
            if (
              settings.faceSwap &&
              clientPhoto &&
              !settings.videosMergeOption
            ) {
              posterVideoId = await runFaceSwap(
                tempclientphotoPath,
                selectedVideoId
              );
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
                tempclientphotoPath,
                selectedVideoId,
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
              posterVideoId: new mongoose.Types.ObjectId(posterVideoId),
              whatsapp,
              whatsappstatus: "pending",
            });
            const downloadUrl = `https://api.bilimbebrandactivations.com/api/upload/file/${media.posterVideoId}?download=true`;
            const qrCodeData = await QRCode.toDataURL(downloadUrl);
            media.qrCode = qrCodeData;
            await media.save();
            await shareOuput(whatsapp, downloadUrl, media._id, {
              json: () => {},
            });
            //res.json({ success: true, media });
          } catch (err) {
            console.error("Background processing error:", err);
          }
        })();
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

module.exports = router;
