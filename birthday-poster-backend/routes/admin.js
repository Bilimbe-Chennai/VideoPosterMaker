const express = require("express");
const { getConnection } = require("../InitDB");
const { Readable } = require("stream");
const AdminSettings = require("../models/AdminSettings.js");
const router = express.Router();
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
router.post("/settings", async (req, res) => {
  try {
    // Files come from form-data
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
      let name, date, type, faceSwap, videosMergeOption;
      let video1Buffer,
        video2Buffer,
        audioBuffer,
        //samplevideoBuffer,
        boyvideoBuffer,
        girlvideoBuffer,
        childboyBuffer,
        childgirlBuffer;
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
        } else if (headersText.includes('name="faceSwap"')) {
          faceSwap = body.toString().trim();
        } else if (headersText.includes('name="videosMergeOption"')) {
          videosMergeOption = body.toString().trim();
        } else if (headersText.includes('name="video1"')) {
          video1Buffer = body;
        } else if (headersText.includes('name="video2"')) {
          video2Buffer = body;
        } else if (headersText.includes('name="audio"')) {
          audioBuffer = body;
        // } else if (headersText.includes('name="samplevideo"')) {
        //   samplevideoBuffer = body;
        } else if (headersText.includes('name="boyvideo"')) {
          boyvideoBuffer = body;
        } else if (headersText.includes('name="girlvideo"')) {
          girlvideoBuffer = body;
        } else if (headersText.includes('name="childboyvideo"')) {
          childboyBuffer = body;
        } else if (headersText.includes('name="childgirlvideo"')) {
          childgirlBuffer = body;
        }
      });

      if (!audioBuffer) {
        return res.status(400).json({ error: "Missing audio or video" });
      }
      // 2. Upload original photo and video to GridFS
      let video1Id;
       if (videosMergeOption === true && faceSwap === false) {
        video1Id = await uploadToGridFS(
        `video1-${Date.now()}.mp4`,
        video1Buffer,
        "video/mp4"
      );
       }
     
      let video2Id;
      if (videosMergeOption === true) {
        video2Id = await uploadToGridFS(
          `video2-${Date.now()}.mp4`,
          video2Buffer,
          "video/mp4"
        );
      }

      const audioId = await uploadToGridFS(
        `audio-${Date.now()}.mp4`,
        audioBuffer,
        "audio/mp3"
      );
      // const sampleVideoId = await uploadToGridFS(
      //   `samplevideo-${Date.now()}.mp4`,
      //   samplevideoBuffer,
      //   "video/mp4"
      // );
      const girlVideoId = await uploadToGridFS(
        `girlvideo-${Date.now()}.mp4`,
        girlvideoBuffer,
        "video/mp4"
      );
      const boyVideoId = await uploadToGridFS(
        `boyvideo-${Date.now()}.mp4`,
        boyvideoBuffer,
        "video/mp4"
      );
      const childGirlVideoId = await uploadToGridFS(
        `childgirlvideo-${Date.now()}.mp4`,
        childgirlBuffer,
        "video/mp4"
      );
      const childBoyVideoId = await uploadToGridFS(
        `childboyvideo-${Date.now()}.mp4`,
        childboyBuffer,
        "video/mp4"
      );
      const settings = new AdminSettings({
        name,
        date,
        type,
        video1Id,
        video2Id,
        audioId,
        //sampleVideoId,
        girlVideoId,
        boyVideoId,
        childGirlVideoId,
        childBoyVideoId,
        faceSwap,
        videosMergeOption,
      });
      await settings.save();
      res.json({ success: true, settings });
    });
  } catch (err) {
    console.error("Admin settings error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Get latest settings
router.get("/settings", async (req, res) => {
  //const latest = await AdminSettings.findOne().sort({ createdAt: -1 });
  const latest = await AdminSettings.find();
  res.json(latest);
});
// Get one settings using id
router.get("/getone/:id", async (req, res) => {
  try {
    const latest = await AdminSettings.findById(req.params.id);
    if (!latest) {
      return res.status(404).json({ message: "Settings not found" });
    }
    res.json(latest);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = router;
