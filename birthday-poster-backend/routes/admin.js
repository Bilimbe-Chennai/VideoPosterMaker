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
        boyvideoBuffer1,
        girlvideoBuffer1,
        childboyBuffer1,
        childgirlBuffer1,
        boyvideoBuffer2,
        girlvideoBuffer2,
        childboyBuffer2,
        childgirlBuffer2,
        boyvideoBuffer3,
        girlvideoBuffer3,
        childboyBuffer3,
        childgirlBuffer3,
        boyvideoBuffer4,
        girlvideoBuffer4,
        childboyBuffer4,
        childgirlBuffer4;
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
        } else if (headersText.includes('name="boyvideo1"')) {
          boyvideoBuffer1 = body;
        } else if (headersText.includes('name="girlvideo1"')) {
          girlvideoBuffer1 = body;
        } else if (headersText.includes('name="childboyvideo1"')) {
          childboyBuffer1 = body;
        } else if (headersText.includes('name="childgirlvideo1"')) {
          childgirlBuffer1 = body;
        } else if (headersText.includes('name="boyvideo2"')) {
          boyvideoBuffer2 = body;
        } else if (headersText.includes('name="girlvideo2"')) {
          girlvideoBuffer2 = body;
        } else if (headersText.includes('name="childboyvideo2"')) {
          childboyBuffer2 = body;
        } else if (headersText.includes('name="childgirlvideo2"')) {
          childgirlBuffer2 = body;
        } else if (headersText.includes('name="boyvideo3"')) {
          boyvideoBuffer3 = body;
        } else if (headersText.includes('name="girlvideo3"')) {
          girlvideoBuffer3 = body;
        } else if (headersText.includes('name="childboyvideo3"')) {
          childboyBuffer3 = body;
        } else if (headersText.includes('name="childgirlvideo3"')) {
          childgirlBuffer3 = body;
        } else if (headersText.includes('name="boyvideo4"')) {
          boyvideoBuffer4 = body;
        } else if (headersText.includes('name="girlvideo4"')) {
          girlvideoBuffer4 = body;
        } else if (headersText.includes('name="childboyvideo4"')) {
          childboyBuffer4 = body;
        } else if (headersText.includes('name="childgirlvideo4"')) {
          childgirlBuffer4 = body;
        }
      });
      // if (!audioBuffer) {
      //   return res.status(400).json({ error: "Missing audio or video" });
      // }
      // 2. Upload original photo and video to GridFS
      let video1Id;
      if (video1Buffer || (videosMergeOption && !faceSwap)) {
        video1Id = await uploadToGridFS(
          `video1-${Date.now()}.mp4`,
          video1Buffer,
          "video/mp4"
        );
      }
      let video2Id;

      const isVideosMergeOption =
        videosMergeOption === true || videosMergeOption === "true";
      if (isVideosMergeOption) {
        if (
          video2Buffer &&
          Buffer.isBuffer(video2Buffer) &&
          video2Buffer.length > 0
        ) {
          video2Id = await uploadToGridFS(
            `video2-${Date.now()}.mp4`,
            video2Buffer,
            "video/mp4"
          );
        } else {
          console.error("? video2Buffer missing or empty");
        }
      } else {
        console.log(
          "?? Skipping video2Buffer upload because videosMergeOption is false"
        );
      }
      let audioId;
      if (isVideosMergeOption) {
        audioId = await uploadToGridFS(
          `audio-${Date.now()}.mp4`,
          audioBuffer,
          "audio/mp3"
        );
      }
      // const sampleVideoId = await uploadToGridFS(
      //   `samplevideo-${Date.now()}.mp4`,
      //   samplevideoBuffer,
      //   "video/mp4"
      // );
      const girlVideoId1 = await uploadToGridFS(
        `girlvideo1-${Date.now()}.mp4`,
        girlvideoBuffer1,
        "video/mp4"
      );
      const boyVideoId1 = await uploadToGridFS(
        `boyvideo1-${Date.now()}.mp4`,
        boyvideoBuffer1,
        "video/mp4"
      );
      const childGirlVideoId1 = await uploadToGridFS(
        `childgirlvideo1-${Date.now()}.mp4`,
        childgirlBuffer1,
        "video/mp4"
      );
      const childBoyVideoId1 = await uploadToGridFS(
        `childboyvideo1-${Date.now()}.mp4`,
        childboyBuffer1,
        "video/mp4"
      );
      const girlVideoId2 = await uploadToGridFS(
        `girlvideo2-${Date.now()}.mp4`,
        girlvideoBuffer2,
        "video/mp4"
      );
      const boyVideoId2 = await uploadToGridFS(
        `boyvideo2-${Date.now()}.mp4`,
        boyvideoBuffer2,
        "video/mp4"
      );
      const childGirlVideoId2 = await uploadToGridFS(
        `childgirlvideo2-${Date.now()}.mp4`,
        childgirlBuffer2,
        "video/mp4"
      );
      const childBoyVideoId2 = await uploadToGridFS(
        `childboyvideo2-${Date.now()}.mp4`,
        childboyBuffer2,
        "video/mp4"
      );
      const girlVideoId3 = await uploadToGridFS(
        `girlvideo3-${Date.now()}.mp4`,
        girlvideoBuffer3,
        "video/mp4"
      );
      const boyVideoId3 = await uploadToGridFS(
        `boyvideo3-${Date.now()}.mp4`,
        boyvideoBuffer3,
        "video/mp4"
      );
      const childGirlVideoId3 = await uploadToGridFS(
        `childgirlvideo3-${Date.now()}.mp4`,
        childgirlBuffer3,
        "video/mp4"
      );
      const childBoyVideoId3 = await uploadToGridFS(
        `childboyvideo3-${Date.now()}.mp4`,
        childboyBuffer3,
        "video/mp4"
      );
      const girlVideoId4 = await uploadToGridFS(
        `girlvideo4-${Date.now()}.mp4`,
        girlvideoBuffer4,
        "video/mp4"
      );
      const boyVideoId4 = await uploadToGridFS(
        `boyvideo4-${Date.now()}.mp4`,
        boyvideoBuffer4,
        "video/mp4"
      );
      const childGirlVideoId4 = await uploadToGridFS(
        `childgirlvideo4-${Date.now()}.mp4`,
        childgirlBuffer4,
        "video/mp4"
      );
      const childBoyVideoId4 = await uploadToGridFS(
        `childboyvideo4-${Date.now()}.mp4`,
        childboyBuffer4,
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
        girlVideoId1,
        boyVideoId1,
        childGirlVideoId1,
        childBoyVideoId1,
        girlVideoId2,
        boyVideoId2,
        childGirlVideoId2,
        childBoyVideoId2,
        girlVideoId3,
        boyVideoId3,
        childGirlVideoId3,
        childBoyVideoId3,
        girlVideoId4,
        boyVideoId4,
        childGirlVideoId4,
        childBoyVideoId4,
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
