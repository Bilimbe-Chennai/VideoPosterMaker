const express = require("express");
const { createCanvas, loadImage } = require("canvas");
const ffmpeg = require("fluent-ffmpeg");
const { GridFSBucket, ObjectId } = require("mongodb");
const mongoose = require("mongoose");
const Media = require("../models/Media");
const { Readable } = require("stream");
const path = require("path");
const os = require("os");
const fs = require("fs/promises"); // ✅ promise-based fs
const router = express.Router();
const { getConnection } = require("../InitDB");
const OpenAI = require("openai");
require("dotenv").config();
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
//whatsapp share function
const token = process.env.WHATSAPP_CHATMYBOT_API_TOKEN;
router.post("/share", async (req, res) => {
  try {
    const toNumber = req.body.mobile;
    const _id = req.body._id;
    const linksend = req.body.link;
    if (!toNumber || !linksend) {
      return res
        .status(400)
        .json({ error: "Phone number and link are required" });
    }
    const response = await fetch(`https://api.chatmybot.com/sendMessage`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        phone: toNumber, // e.g. "919876543210"
        message: linksend, // The link to send
      }),
    });
    const data = await response.json();
    if (data) {
      console.log(data);
      const dataGet = await Media.findByIdAndUpdate(
        _id,
        { whatsappstatus: "yes" },
        { new: true }
      );
      res.json({ success: true, dataGet });
    }
  } catch (err) {
    console.error("Error fetching media items:", err);
    res.status(500).json({ error: "Server error while fetching media items" });
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
    const fileId = new mongoose.Types.ObjectId(req.params.id);
    const bucket = getGridFSBucket();

    const downloadStream = bucket.openDownloadStream(fileId);

    // Set headers (optional but helpful)
    downloadStream.on("file", (file) => {
      res.setHeader(
        "Content-Type",
        file.contentType || "application/octet-stream"
      );
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${file.filename}"`
      );
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
// GET all media items
router.get("/all", async (req, res) => {
  try {
    const mediaItems = await Media.find().sort({ createdAt: -1 }); // Get all items, newest first
    res.json(mediaItems);
  } catch (err) {
    console.error("Error fetching media items:", err);
    res.status(500).json({ error: "Server error while fetching media items" });
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
      });
      await media.save();
       const downloadUrl = `http://api.bilimbebrandactivations.com/api/upload/file/${media.mergedVideoId}?download=true`;
      const qrCodeData = await QRCode.toDataURL(downloadUrl);

      // ✅ Safely delete all other temporary files
      const tempFiles = [tempOriginalVideo];
      for (const file of tempFiles) {
        if (file) {
          fs.unlink(file).catch(() => {}); // ignore if file is already deleted/missing
        }
      }
     res.status(201).json({ success: true, media, qrCode: qrCodeData });
    });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
});
// photo and gif merge for muthoot 
router.post(
  "/photogif",
  async (req, res) => {
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
      });

      await media.save();
     const downloadUrl = `http://api.bilimbebrandactivations.com/api/upload/file/${media.posterVideoId}?download=true`;
      const qrCodeData = await QRCode.toDataURL(downloadUrl);

      const tempFiles = [tempGifPath];
      for (const file of tempFiles) {
        if (file) {
          fs.unlink(file).catch(() => {}); // ignore if file is already deleted/missing
        }
      }
      res.status(201).json({ success: true, media, qrCode: qrCodeData });
    });
    } catch (error) {
      console.error("Upload error:", error);
      res.status(500).json({ success: false, error: "Internal Server Error" });
    }
  }
);
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
            "[0:v]scale=720:1080,fps=30,setsar=1[v0]",
            "[1:v]scale=720:1080,fps=30,setsar=1[v1]",
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
      });

      await media.save();
      const downloadUrl = `http://api.bilimbebrandactivations.com/api/upload/file/${media.posterVideoId}?download=true`;
      const qrCodeData = await QRCode.toDataURL(downloadUrl);

      const tempFiles = [tempAudioPath];
      for (const file of tempFiles) {
        if (file) {
          fs.unlink(file).catch(() => {}); // ignore if file is already deleted/missing
        }
      }
      res.status(201).json({ success: true, media, qrCode: qrCodeData });
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

//       await media.save();

//       const downloadUrl = `http://api.bilimbebrandactivations.com/api/upload/file/${media.posterVideoId}?download=true`;
//       const qrCodeData = await QRCode.toDataURL(downloadUrl);

//       res.status(201).json({ success: true, media, qrCode: qrCodeData });
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

//       await media.save();
//       // Create a download URL for the posterVideoId
//       const downloadUrl = `http://api.bilimbebrandactivations.com/api/upload/file/${media?.posterVideoId}?download=true`;
//       // Generate QR code as base64
//       const qrCodeData = await QRCode.toDataURL(downloadUrl);
//       // Send response with media and QR code
//       res.status(201).json({
//         success: true,
//         media,
//         qrCode: qrCodeData, // This is a base64 string you can directly display in frontend
//       });
//       // res.json({ success: true, media });
//     } catch (error) {
//       console.error("Upload error:", error);
//       res.status(500).json({ success: false, error: "Internal Server Error" });
//     }
//   }
// );
module.exports = router;
