const express = require("express");
const { getConnection } = require("../InitDB");
const { Readable } = require("stream");
const AdminSettings = require("../models/AdminSettings.js");
const TemplateGuide = require("../models/TemplateGuide.js");
const Animation = require("../models/Animation.js");
const { mergeThreeVideos } = require("../utils/videoMerge.js");
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
      //       const videoMap = {
      //   video1: video1Buffer,
      //   video2: video2Buffer,

      //   boyvideo1: boyvideoBuffer1,
      //   girlvideo1: girlvideoBuffer1,
      //   childboyvideo1: childboyBuffer1,
      //   childgirlvideo1: childgirlBuffer1,

      //   boyvideo2: boyvideoBuffer2,
      //   girlvideo2: girlvideoBuffer2,
      //   childboyvideo2: childboyBuffer2,
      //   childgirlvideo2: childgirlBuffer2,

      //   boyvideo3: boyvideoBuffer3,
      //   girlvideo3: girlvideoBuffer3,
      //   childboyvideo3: childboyBuffer3,
      //   childgirlvideo3: childgirlBuffer3,

      //   boyvideo4: boyvideoBuffer4,
      //   girlvideo4: girlvideoBuffer4,
      //   childboyvideo4: childboyBuffer4,
      //   childgirlvideo4: childgirlBuffer4,
      // };
      // const uploadedVideoIds = {};

      // for (const [key, buffer] of Object.entries(videoMap)) {
      //   if (Buffer.isBuffer(buffer) && buffer.length > 0) {
      //     uploadedVideoIds[`${key}Id`] = await uploadToGridFS(
      //       `${key}-${Date.now()}.mp4`,
      //       buffer,
      //       "video/mp4"
      //     );
      //   }
      // }
      // let audioId;
      // if (Buffer.isBuffer(audioBuffer) && audioBuffer.length > 0) {
      //   audioId = await uploadToGridFS(
      //     `audio-${Date.now()}.mp3`,
      //     audioBuffer,
      //     "audio/mp3"
      //   );
      // }
      // if (Object.keys(uploadedVideoIds).length > 16) {
      //   return res.status(400).json({ error: "Maximum 16 videos allowed" });
      // }

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
      //       const settings = new AdminSettings({
      //   name,
      //   date,
      //   type,
      //   faceSwap,
      //   videosMergeOption,
      //   audioId,
      //   ...uploadedVideoIds,
      // });

      await settings.save();
      res.json({ success: true, settings });
    });
  } catch (err) {
    console.error("Admin settings error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});
// router.post("/settings", async (req, res) => {
//   try {
//     const contentType = req.headers["content-type"];
//     if (!contentType || !contentType.includes("multipart/form-data")) {
//       return res.status(400).json({ error: "Invalid content type" });
//     }

//     const boundary = "--" + contentType.split("boundary=")[1];
//     let chunks = [];

//     req.on("data", (chunk) => chunks.push(chunk));

//     req.on("end", async () => {
//       const buffer = Buffer.concat(chunks);
//       const boundaryBuffer = Buffer.from(boundary);
//       const parts = splitBuffer(buffer, boundaryBuffer).slice(1, -1);

//       let name, date, type, faceSwap, videosMergeOption;
//       let audioBuffer;

//       // VIDEO BUFFERS (same keys)
//       const buffers = {};

//       parts.forEach((part) => {
//         const [rawHeaders, rawBody] = splitBuffer(
//           part,
//           Buffer.from("\r\n\r\n")
//         );
//         const headersText = rawHeaders.toString();
//         const body = rawBody.slice(0, rawBody.length - 2);

//         if (headersText.includes('name="name"')) name = body.toString();
//         else if (headersText.includes('name="date"')) date = body.toString();
//         else if (headersText.includes('name="type"')) type = body.toString();
//         else if (headersText.includes('name="faceSwap"')) faceSwap = body.toString();
//         else if (headersText.includes('name="videosMergeOption"'))
//           videosMergeOption = body.toString();
//         else if (headersText.includes('name="audio"')) audioBuffer = body;

//         // 👇 collect ALL video buffers dynamically
//         const match = headersText.match(/name="(video\d+|boyvideo\d+|girlvideo\d+|childboyvideo\d+|childgirlvideo\d+)"/);
//         if (match) {
//           buffers[match[1]] = body;
//         }
//       });

//       // UPLOAD VIDEOS
//       const uploadedVideoIds = {};
//       for (const [key, buf] of Object.entries(buffers)) {
//         if (Buffer.isBuffer(buf) && buf.length > 0) {
//           uploadedVideoIds[`${key}Id`] = await uploadToGridFS(
//             `${key}-${Date.now()}.mp4`,
//             buf,
//             "video/mp4"
//           );
//         }
//       }

//       // UPLOAD AUDIO (optional)
//       let audioId;
//       if (Buffer.isBuffer(audioBuffer) && audioBuffer.length > 0) {
//         audioId = await uploadToGridFS(
//           `audio-${Date.now()}.mp3`,
//           audioBuffer,
//           "audio/mp3"
//         );
//       }

//       // SAVE SETTINGS
//       const settings = new AdminSettings({
//         name,
//         date,
//         type,
//         faceSwap,
//         videosMergeOption,
//         audioId,
//         ...uploadedVideoIds,
//       });

//       await settings.save();

//       res.json({ success: true, settings });
//     });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ success: false, error: err.message });
//   }
// });

//----->create option only for 3 video merge
// router.post("/settings/videovideovideo", async (req, res) => {
//   try {
//       let posterVideoId;
//     // Files come from form-data
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
//       const buffer = Buffer.concat(chunks);
//       const boundaryBuffer = Buffer.from(boundary);
//       const parts = splitBuffer(buffer, boundaryBuffer).slice(1, -1); // remove first/last boundary markers
//       let name, date, type, faceSwap, videosMergeOption,clientname,brandname,congratsOption,video1TextOption,video2TextOption,video3TextOption,approved;
//       let video1Buffer,
//         video2Buffer,
//         video3Buffer,
//         audioBuffer;
//       const whatsappstatus = "pending";
//       parts.forEach((part) => {
//         const [rawHeaders, rawBody] = splitBuffer(
//           part,
//           Buffer.from("\r\n\r\n")
//         );
//         const headersText = rawHeaders.toString();
//         const body = rawBody.slice(0, rawBody.length - 2); // remove trailing CRLF
//         if (headersText.includes('name="name"')) {
//           name = body.toString().trim();
//         } else if (headersText.includes('name="date"')) {
//           date = body.toString().trim();
//         } else if (headersText.includes('name="type"')) {
//           type = body.toString().trim();
//         } else if (headersText.includes('name="faceSwap"')) {
//           faceSwap = body.toString().trim();
//         } else if (headersText.includes('name="clientname"')) {
//           clientname = body.toString().trim();
//         } else if (headersText.includes('name="brandname"')) {
//           brandname = body.toString().trim();
//         } else if (headersText.includes('name="congratsOption"')) {
//           congratsOption = body.toString().trim();
//         }else if (headersText.includes('name="video1TextOption"')) {
//           video1TextOption = body.toString().trim();
//         }else if (headersText.includes('name="video2TextOption"')) {
//           video2TextOption = body.toString().trim();
//         }else if (headersText.includes('name="video3TextOption"')) {
//           video3TextOption = body.toString().trim();
//         }else if (headersText.includes('name="videosMergeOption"')) {
//           videosMergeOption = body.toString().trim();
//         }else if (headersText.includes('name="approved"')) {
//           approved = body.toString().trim();
//         } else if (headersText.includes('name="video1"')) {
//           video1Buffer = body;
//         } else if (headersText.includes('name="video2"')) {
//           video2Buffer = body;
//         } else if (headersText.includes('name="audio"')) {
//           audioBuffer = body;
//         } else if (headersText.includes('name="video3"')) {
//           video3Buffer = body;
//         } 
//       });
//       // if (!audioBuffer) {
//       //   return res.status(400).json({ error: "Missing audio or video" });
//       // }
//       // 2. Upload original photo and video to GridFS
//       let video1Id;

//         video1Id = await uploadToGridFS(
//           `video1-${Date.now()}.mp4`,
//           video1Buffer,
//           "video/mp4"
//         );
//       let video2Id;
//           video2Id = await uploadToGridFS(
//             `video2-${Date.now()}.mp4`,
//             video2Buffer,
//             "video/mp4"
//           );
//           let video3Id;
//           video3Id = await uploadToGridFS(
//             `video3-${Date.now()}.mp4`,
//             video3Buffer,
//             "video/mp4"
//           );
//       let audioId;
//         audioId = await uploadToGridFS(
//           `audio-${Date.now()}.mp4`,
//           audioBuffer,
//           "audio/mp3"
//         );

//    posterVideoId = await mergeThreeVideos({
//                 name: name,
//                 date: date,
//                 type: type,
//                 video1Id: video1Id,
//                 video2Id: video2Id,
//                 video3Id: video3Id,
//                 audioId: audioId,
//                 clientname,
//                 brandname,
//                 congratsOption,
//                 video1TextOption,video2TextOption,video3TextOption
//               });
//       const media = new AdminSettings({
//         name,
//         date,
//         type,
//         video1Id,
//         video2Id,
//         video3Id,
//         audioId,
//         faceSwap,
//         videosMergeOption,
//         mergedVideoId:posterVideoId,
//         clientname,
//         brandname,
//         congratsOption,
//         video1TextOption,video2TextOption,video3TextOption,
//         approved
//       }); 
//       await media.save();
//       res.json({ success: true, media });
//     });
//   } catch (err) {
//     console.error("Admin settings error:", err);
//     res.status(500).json({ success: false, error: err.message });
//   }
// });
// Get latest settings
router.post("/settings/videovideovideo", async (req, res) => {
  try {
    let posterVideoId;
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

      let name, date, type, faceSwap, videosMergeOption, clientname, brandname,
        congratsOption, video1TextOption, video2TextOption, video3TextOption, approved,
        overlayTextColor, overlayFontFamily;
      let video1Buffer, video2Buffer, video3Buffer, audioBuffer;

      // NEW: Check if this is an edit
      let isEdit = false;
      let editId = null;

      const whatsappstatus = "pending";

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
        } else if (headersText.includes('name="clientname"')) {
          clientname = body.toString().trim();
        } else if (headersText.includes('name="brandname"')) {
          brandname = body.toString().trim();
        } else if (headersText.includes('name="congratsOption"')) {
          congratsOption = body.toString().trim();
        } else if (headersText.includes('name="video1TextOption"')) {
          video1TextOption = body.toString().trim();
        } else if (headersText.includes('name="video2TextOption"')) {
          video2TextOption = body.toString().trim();
        } else if (headersText.includes('name="video3TextOption"')) {
          video3TextOption = body.toString().trim();
        } else if (headersText.includes('name="overlayTextColor"')) {
          overlayTextColor = body.toString().trim();
        } else if (headersText.includes('name="overlayFontFamily"')) {
          overlayFontFamily = body.toString().trim();
        } else if (headersText.includes('name="videosMergeOption"')) {
          videosMergeOption = body.toString().trim();
        } else if (headersText.includes('name="approved"')) {
          approved = body.toString().trim();
        } else if (headersText.includes('name="_id"')) {  // NEW: Check for _id
          editId = body.toString().trim();
        } else if (headersText.includes('name="isEdit"')) {  // NEW: Check for isEdit flag
          isEdit = body.toString().trim();
        } else if (headersText.includes('name="video1"')) {
          video1Buffer = body.length > 0 ? body : null;
        } else if (headersText.includes('name="video2"')) {
          video2Buffer = body.length > 0 ? body : null;
        } else if (headersText.includes('name="audio"')) {
          if (body.length > 0) {
            audioBuffer = {
              buffer: body,
              filename: headersText.match(/filename="(.+?)"/)?.[1] || `audio-${Date.now()}.mp3`,
              contentType: headersText.match(/Content-Type: (.+?)\r\n/)?.[1] || 'audio/mpeg'
            };
          } else {
            audioBuffer = null;
          }
        } else if (headersText.includes('name="video3"')) {
          video3Buffer = body.length > 0 ? body : null;
        }
      });

      // Upload files to GridFS
      let video1Id, video2Id, video3Id, audioId;

      // Handle video1 - upload new or keep existing
      if (video1Buffer) {
        video1Id = await uploadToGridFS(
          `video1-${Date.now()}.mp4`,
          video1Buffer,
          "video/mp4"
        );
      } else if (isEdit && editId) {
        // If editing and no new video1, we need to get existing video1Id
        const existingMedia = await AdminSettings.findById(editId);
        if (existingMedia) {
          video1Id = existingMedia.video1Id;
        }
      }

      // Handle video2
      if (video2Buffer) {
        video2Id = await uploadToGridFS(
          `video2-${Date.now()}.mp4`,
          video2Buffer,
          "video/mp4"
        );
      } else if (isEdit && editId) {
        const existingMedia = await AdminSettings.findById(editId);
        if (existingMedia) {
          video2Id = existingMedia.video2Id;
        }
      }

      // Handle video3
      if (video3Buffer) {
        video3Id = await uploadToGridFS(
          `video3-${Date.now()}.mp4`,
          video3Buffer,
          "video/mp4"
        );
      } else if (isEdit && editId) {
        const existingMedia = await AdminSettings.findById(editId);
        if (existingMedia) {
          video3Id = existingMedia.video3Id;
        }
      }

      // Handle audio - can be audio or video file
      if (audioBuffer) {
        // Check if it's a video file and extract audio if needed
        const filename = audioBuffer.filename || '';
        const contentType = audioBuffer.contentType || '';
        const isVideo = filename.match(/\.(mp4|avi|mov|mkv|webm|flv|wmv|m4v)$/i) || 
                       contentType.startsWith('video/');
        
        let finalAudioBuffer = audioBuffer.buffer;
        
        if (isVideo) {
          // Extract audio from video
          const { extractAudioFromVideo } = require('../utils/videoMerge');
          const extension = filename.split('.').pop() || 'mp4';
          finalAudioBuffer = await extractAudioFromVideo(finalAudioBuffer, extension);
        }
        
        audioId = await uploadToGridFS(
          `audio-${Date.now()}.mp3`,
          finalAudioBuffer,
          "audio/mp3"
        );
      } else if (isEdit && editId) {
        const existingMedia = await AdminSettings.findById(editId);
        if (existingMedia) {
          audioId = existingMedia.audioId;
        }
      }

      // Get template for overlay text settings
      let template = null;
      if (editId) {
        template = await AdminSettings.findById(editId);
      }
      
      // Generate merged video
      posterVideoId = await mergeThreeVideos({
        name: name,
        date: date,
        type: type,
        video1Id: video1Id,
        video2Id: video2Id,
        video3Id: video3Id,
        audioId: audioId,
        clientname,
        brandname,
        congratsOption,
        video1TextOption, video2TextOption, video3TextOption,
        textColor: template?.overlayTextColor || 'white',
        fontFamily: template?.overlayFontFamily || 'Arial'
      });

      let media;

      if (isEdit && editId) {
        // UPDATE EXISTING MEDIA
        media = await AdminSettings.findByIdAndUpdate(
          editId,
          {
            name,
            date,
            type,
            video1Id,
            video2Id,
            video3Id,
            audioId,
            faceSwap,
            videosMergeOption,
            mergedVideoId: posterVideoId,
            clientname,
            brandname,
            congratsOption,
            video1TextOption, video2TextOption, video3TextOption,
            overlayTextColor: overlayTextColor || 'white',
            overlayFontFamily: overlayFontFamily || 'Arial',
            approved,
            updatedAt: new Date()
          },
          { new: true } // Return the updated document
        );

        if (!media) {
          return res.status(404).json({ error: "Media not found for update" });
        }
      } else {
        // CREATE NEW MEDIA
        media = new AdminSettings({
          name,
          date,
          type,
          video1Id,
          video2Id,
          video3Id,
          audioId,
          faceSwap,
          videosMergeOption,
          mergedVideoId: posterVideoId,
          overlayTextColor: overlayTextColor || 'white',
          overlayFontFamily: overlayFontFamily || 'Arial',
          clientname,
          brandname,
          congratsOption,
          video1TextOption, video2TextOption, video3TextOption,
          approved
        });

        await media.save();
      }

      res.json({ success: true, media });
    });
  } catch (err) {
    console.error("Admin settings error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});
router.get("/settings", async (req, res) => {
  //const latest = await AdminSettings.findOne().sort({ createdAt: -1 });
  const latest = await AdminSettings.find();
  res.json(latest.reverse());
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
// 4. GET ALL APPROVED VIDEOS API (optional)
router.get('/approved', async (req, res) => {
  try {
    const approvedVideos = await AdminSettings.find({ approved: true })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: approvedVideos.length,
      videos: approvedVideos
    });

  } catch (error) {
    console.error('Get approved videos error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch approved videos',
      error: error.message
    });
  }
});
// Single approve video function
router.post('/approve/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const media = await AdminSettings.findById(id);
    if (!media) return res.status(404).json({ success: false, message: 'Video not found' });
    media.approved = true;
    media.approvedAt = new Date();
    await media.save();
    res.json({ success: true, message: 'Video approved successfully', media });
  } catch (error) {
    console.error('Approve video error:', error);
    res.status(500).json({ success: false, message: 'Failed to approve video', error: error.message });
  }
});

// Bulk approve settings
router.post('/bulk-approve', async (req, res) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids)) {
      return res.status(400).json({ success: false, message: 'Invalid IDs array' });
    }
    await AdminSettings.updateMany(
      { _id: { $in: ids } },
      { $set: { approved: true, approvedAt: new Date() } }
    );
    res.json({ success: true, message: `${ids.length} items approved successfully` });
  } catch (error) {
    console.error('Bulk approve error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE a specific setting
router.delete('/settings/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deletedSetting = await AdminSettings.findByIdAndDelete(id);
    if (!deletedSetting) {
      return res.status(404).json({ success: false, message: 'Setting not found' });
    }
    res.json({ success: true, message: 'Setting deleted successfully' });
  } catch (error) {
    console.error('Delete setting error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ========== Template Guide PDF Routes ==========

// Upload PDF guide for a specific accessType
router.post("/template-guide/upload", async (req, res) => {
  try {
    const contentType = req.headers["content-type"];
    if (!contentType || !contentType.includes("multipart/form-data")) {
      return res.status(400).json({ error: "Invalid content type" });
    }

    const boundary = "--" + contentType.split("boundary=")[1];
    let chunks = [];
    req.on("data", (chunk) => chunks.push(chunk));
    req.on("end", async () => {
      try {
        const buffer = Buffer.concat(chunks);
        const boundaryBuffer = Buffer.from(boundary);
        const parts = splitBuffer(buffer, boundaryBuffer).slice(1, -1);

        let accessType, adminid, displayName = '';
        let pdfBuffer;

        parts.forEach((part) => {
          const [rawHeaders, rawBody] = splitBuffer(part, Buffer.from("\r\n\r\n"));
          const headersText = rawHeaders.toString();
          
          if (headersText.includes('name="accessType"')) {
            const body = rawBody.slice(0, rawBody.length - 2);
            accessType = body.toString().trim();
          } else if (headersText.includes('name="displayName"')) {
            const body = rawBody.slice(0, rawBody.length - 2);
            displayName = body.toString().trim();
          } else if (headersText.includes('name="adminid"')) {
            const body = rawBody.slice(0, rawBody.length - 2);
            adminid = body.toString().trim();
          } else if (headersText.includes('name="pdf"') || headersText.includes('name="file"')) {
            // Check if this is a file field (has filename in Content-Disposition)
            const isFileField = headersText.includes('filename=');
            if (isFileField) {
              // For file fields, remove trailing \r\n before the boundary
              const endIndex = rawBody.length - 2;
              pdfBuffer = rawBody.slice(0, endIndex > 0 ? endIndex : rawBody.length);
            }
          }
        });

        if (!accessType) {
          console.error("Template guide upload: Access type missing");
          return res.status(400).json({ error: "Access type is required" });
        }

        if (!pdfBuffer || pdfBuffer.length === 0) {
          console.error("Template guide upload: PDF buffer is missing or empty");
          return res.status(400).json({ error: "PDF file is required" });
        }

        // Validate accessType format (alphanumeric and underscores only, lowercase)
        if (!/^[a-z0-9_]+$/.test(accessType)) {
          return res.status(400).json({ error: "Access type must contain only lowercase letters, numbers, and underscores" });
        }

        // Upload PDF to GridFS
        const filename = `template-guide-${accessType}-${Date.now()}.pdf`;
        const pdfId = await uploadToGridFS(filename, pdfBuffer, "application/pdf");

        // Save or update guide record
        const guideData = {
          accessType,
          displayName: displayName || '',
          pdfId,
          filename,
          uploadedBy: adminid || '',
          updatedAt: new Date()
        };

        const guide = await TemplateGuide.findOneAndUpdate(
          { accessType },
          guideData,
          { upsert: true, new: true }
        );

        res.json({
          success: true,
          message: "PDF guide uploaded successfully",
          guide: {
            accessType: guide.accessType,
            filename: guide.filename,
            uploadedAt: guide.uploadedAt,
            updatedAt: guide.updatedAt
          }
        });
      } catch (err) {
        console.error("Template guide upload error:", err);
        res.status(500).json({ error: "Failed to upload PDF guide", message: err.message });
      }
    });
  } catch (err) {
    console.error("Template guide upload error:", err);
    res.status(500).json({ error: "Server error", message: err.message });
  }
});

// Get PDF guide by accessType
router.get("/template-guide/:accessType", async (req, res) => {
  try {
    const { accessType } = req.params;

    const guide = await TemplateGuide.findOne({ accessType });
    if (!guide) {
      return res.status(404).json({ error: "PDF guide not found for this access type" });
    }

    // Get PDF file from GridFS
    const { bucket } = getConnection();
    const downloadStream = bucket.openDownloadStream(guide.pdfId);

    downloadStream.on("file", (file) => {
      res.setHeader("Content-Type", file.contentType || "application/pdf");
      res.setHeader("Content-Disposition", `inline; filename="${file.filename}"`);
    });

    downloadStream.on("error", (err) => {
      console.error("Error downloading PDF:", err);
      res.status(500).json({ error: "Failed to retrieve PDF file" });
    });

    downloadStream.pipe(res);
  } catch (err) {
    console.error("Get template guide error:", err);
    res.status(500).json({ error: "Server error", message: err.message });
  }
});

// Get all template guides (metadata only, not the PDFs)
router.get("/template-guide", async (req, res) => {
  try {
    const guides = await TemplateGuide.find().select("-pdfId").sort({ accessType: 1 });
    res.json({ success: true, guides });
  } catch (err) {
    console.error("Get all template guides error:", err);
    res.status(500).json({ error: "Server error", message: err.message });
  }
});

// ========== ANIMATION GIF ROUTES ==========

// Upload animation GIF
router.post("/animation/upload", async (req, res) => {
  try {
    const contentType = req.headers["content-type"];
    if (!contentType || !contentType.includes("multipart/form-data")) {
      return res.status(400).json({ error: "Invalid content type" });
    }

    const boundary = "--" + contentType.split("boundary=")[1];
    let chunks = [];
    req.on("data", (chunk) => chunks.push(chunk));
    req.on("end", async () => {
      try {
        const buffer = Buffer.concat(chunks);
        const boundaryBuffer = Buffer.from(boundary);
        const parts = splitBuffer(buffer, boundaryBuffer).slice(1, -1);

        let name, adminid;
        let gifBuffer;

        parts.forEach((part) => {
          const [rawHeaders, rawBody] = splitBuffer(part, Buffer.from("\r\n\r\n"));
          const headersText = rawHeaders.toString();
          
          if (headersText.includes('name="name"')) {
            const body = rawBody.slice(0, rawBody.length - 2);
            name = body.toString().trim();
          } else if (headersText.includes('name="adminid"')) {
            const body = rawBody.slice(0, rawBody.length - 2);
            adminid = body.toString().trim();
          } else if (headersText.includes('name="gif"') || headersText.includes('name="file"')) {
            const isFileField = headersText.includes('filename=');
            if (isFileField) {
              const endIndex = rawBody.length - 2;
              gifBuffer = rawBody.slice(0, endIndex > 0 ? endIndex : rawBody.length);
            }
          }
        });

        if (!name || !name.trim()) {
          return res.status(400).json({ error: "Animation name is required" });
        }

        if (!gifBuffer || gifBuffer.length === 0) {
          return res.status(400).json({ error: "GIF file is required" });
        }

        // Upload GIF to GridFS
        const filename = `animation-${name.replace(/\s+/g, '-')}-${Date.now()}.gif`;
        const gifId = await uploadToGridFS(filename, gifBuffer, "image/gif");

        // Save animation record
        const animation = new Animation({
          name: name.trim(),
          gifId,
          filename,
          uploadedBy: adminid || '',
          updatedAt: new Date()
        });

        await animation.save();

        res.json({
          success: true,
          message: "Animation GIF uploaded successfully",
          animation: {
            id: animation._id,
            name: animation.name,
            gifId: animation.gifId,
            filename: animation.filename,
            createdAt: animation.createdAt
          }
        });
      } catch (err) {
        console.error("Animation upload error:", err);
        res.status(500).json({ error: "Failed to upload animation GIF", message: err.message });
      }
    });
  } catch (err) {
    console.error("Animation upload error:", err);
    res.status(500).json({ error: "Server error", message: err.message });
  }
});

// Get all animations
router.get("/animation", async (req, res) => {
  try {
    const animations = await Animation.find().sort({ createdAt: -1 });
    res.json({ success: true, animations });
  } catch (err) {
    console.error("Get all animations error:", err);
    res.status(500).json({ error: "Server error", message: err.message });
  }
});

// Delete animation
router.delete("/animation/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const animation = await Animation.findById(id);
    if (!animation) {
      return res.status(404).json({ error: "Animation not found" });
    }

    // Optionally delete from GridFS (you may want to keep it for existing templates)
    await Animation.findByIdAndDelete(id);
    res.json({ success: true, message: "Animation deleted successfully" });
  } catch (err) {
    console.error("Delete animation error:", err);
    res.status(500).json({ error: "Server error", message: err.message });
  }
});

// Delete template guide
router.delete("/template-guide/:accessType", async (req, res) => {
  try {
    const { accessType } = req.params;

    const guide = await TemplateGuide.findOne({ accessType });
    if (!guide) {
      return res.status(404).json({ error: "PDF guide not found" });
    }

    // Delete PDF from GridFS
    const { bucket } = getConnection();
    try {
      await bucket.delete(guide.pdfId);
    } catch (deleteErr) {
      console.error("Error deleting PDF from GridFS:", deleteErr);
    }

    // Delete guide record
    await TemplateGuide.deleteOne({ accessType });

    res.json({ success: true, message: "PDF guide deleted successfully" });
  } catch (err) {
    console.error("Delete template guide error:", err);
    res.status(500).json({ error: "Server error", message: err.message });
  }
});

module.exports = router;
