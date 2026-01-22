require("dotenv").config();
const axios = require("axios");
const fs = require("fs/promises");
const fs2 = require("fs");
const path = require("path");
const os = require("os");
const { Readable } = require("stream");
const { getConnection } = require("../InitDB");
const FormData = require("form-data");
const MagicHour = require("magic-hour");
const Client = MagicHour.default;
const fetch = require("node-fetch");
const { getVideoDuration } = require("./videoDuration");
const { ObjectId } = require("mongodb");
const { PassThrough } = require("stream");
// function cloneToSafeTemp(originalPath) {
//   if (!fs2.existsSync(originalPath)) {
//     throw new Error(`Source image missing before clone: ${originalPath}`);
//   }

//   const ext = path.extname(originalPath) || ".jpg";
//   const safePath = path.join(
//     os.tmpdir(),
//     `faceswap-input-${Date.now()}${ext}`
//   );

//   fs2.copyFileSync(originalPath, safePath);
//   return safePath;
// }
async function getFileFromGridFS(fileId) {
  const { bucket } = getConnection();

  return new Promise((resolve, reject) => {
    const chunks = [];
    bucket
      .openDownloadStream(fileId)
      .on("data", (chunk) => chunks.push(chunk))
      .on("end", () => resolve(Buffer.concat(chunks)))
      .on("error", reject);
  });
}
/* Upload buffer to GridFS */
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
const saveTempFile = async (buffer, extension) => {
  const fileName = `${Date.now()}-${Math.random()
    .toString(36)
    .slice(2)}.${extension}`;
  const tempFilePath = path.join(os.tmpdir(), fileName);

  await fs.writeFile(tempFilePath, buffer);
  return tempFilePath;
};
function fileToBase64(path) {
  return fs2.readFileSync(path).toString("base64");
}
// Convert file → base64
async function imageFileToBase64(imagePath) {
  const imageData = await fs.readFile(path.resolve(imagePath)); // ✅ async, no readFileSync
  return imageData.toString("base64");
}
const client = new Client({
  token: process.env.MAGICOUR_API_KEY, // Magic Hour API key
});
// Call Segmind FaceSwap
// async function runFaceSwap(imagePath, video1Id) {
//   if (!imagePath) {
//     throw new Error("runFaceSwap: imagePath is undefined");
//   }
//   if (!fs2.existsSync(imagePath)) {
//     throw new Error(`Image file does not exist: ${imagePath}`);
//   }

//   const api_key = process.env.SEGMENT_API_KEY;
//   const url = "https://api.segmind.com/v1/videofaceswap";

//   const base64Image = await imageFileToBase64(imagePath);
//   // Get input video from GridFS
//   const video1Buffer = await getFileFromGridFS(video1Id);
//   if (!video1Buffer) {
//     throw new Error(`Could not fetch video with id: ${video1Id}`);
//   }
//   const tempVideoPath = await saveTempFile(video1Buffer, "mp4");
//   if (!tempVideoPath) {
//     throw new Error("saveTempFile failed to return a path");
//   }
//   const data = {
//     source_img: base64Image,
//     video_input:`https://api.bilimbebrandactivations.com/api/upload/file/${video1Id}`,
//      input_faces_index: 0,
//     source_faces_index: 0,
//     face_restore: true,
//     face_restore_visibility: 1,
//     codeformer_weight: 0.95,
//     detect_gender_input: "no",
//     detect_gender_source: "no",
//     frame_load_cap: 0,
//     //base_64: false ,
//   };

//   try {
//     const response = await axios.post(url, data, {
//       headers: { "x-api-key": api_key, "Content-Type": "application/json" },
//   responseType: "stream",
// maxContentLength: Infinity,
//       maxBodyLength: Infinity,
//  validateStatus: () => true
//     });
// const ctype = String(response.headers["content-type"] || "").toLowerCase();
//     // Use base64 output from API
//   if (response.status >= 200 && response.status < 300 && ctype.startsWith("video/")) {
//     // Save to GridFS instead of filesystem
//     //const swappedBuffer = Buffer.from(response.data);
//     const swappedVideoId = await uploadToGridFS(
//       `faceswap-${Date.now()}.mp4`,
//       response.data,
//       "video/mp4"
//     );
//     // Cleanup temp video
//     await fs.unlink(tempVideoPath).catch(() => {});
//     return swappedVideoId; // return path of processed video
// }
//   } catch (error) {
//     await fs.unlink(tempVideoPath).catch(() => {});
//     // Error path: try to surface readable info
//   let errText = "";
//   try { errText = Buffer.from(response.data).toString("utf8").slice(0, 2000); } catch {}
//   throw new Error(`FaceSwap API returned invalid response (status ${response.status}, content-type ${ctype}). Body: ${errText}`);  }
// }
async function waitForAssetReady(assetPath, maxRetries = 20, delayMs = 2000) {
  let attempt = 0;
  while (attempt < maxRetries) {
    attempt++;

    const res = await fetch(`https://api.magichour.ai/v1/video-projects/${assetPath}`, {
      headers: { Authorization: `Bearer ${process.env.MAGICOUR_API_KEY}` },
    });

    if (!res.ok) throw new Error(`Failed to fetch asset status: ${res.statusText}`);

    const data = await res.json();

    // You need to check the field that indicates the asset is processed
    if (data.status === "ready" || data.status === "complete") {
      return true;
    }

    // Wait before next attempt
    await new Promise(r => setTimeout(r, delayMs));
  }

  throw new Error(`Asset not ready: ${assetPath}`);
}


function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function runFaceSwap(imageBuffer, video1Id) {
  if (!Buffer.isBuffer(imageBuffer)) {
    throw new Error("runFaceSwap: imageBuffer is not a Buffer");
  }
  const tempImagePath = await saveTempFile(imageBuffer, "jpg");
  // if (!fs2.existsSync(imagePath)) throw new Error(`Image not found: ${imagePath}`);
  //const safeImagePath = cloneToSafeTemp(imagePath);
  // 🔹 Fetch video from GridFS
  const videoBuffer = await getFileFromGridFS(video1Id);
  if (!videoBuffer) {
    throw new Error(`Could not fetch video with id: ${video1Id}`);
  }
  // 🔹 Save GridFS video to temp file
  const tempVideoPath = await saveTempFile(videoBuffer, "mp4");
  // 🔥 GET TOTAL VIDEO DURATION
  const videoDuration = await getVideoDuration(tempVideoPath);
  existsVideo: fs2.existsSync(tempVideoPath),
  existsImage: fs2.existsSync(tempImagePath),
});
const safeDuration = Math.max(1, Math.floor(videoDuration - 1));

// const uploadRes = await client.v1.files.uploadUrls.create({
//   items: [
//     { type: "video", extension: "mp4" },
//     { type: "image", extension: "jpg" },
//   ],
// });
// const videoUpload = uploadRes.items[0];
// const imageUpload = uploadRes.items[1];

// const videoUploadUrl = videoUpload.uploadUrl;
// const videoAssetPath = videoUpload.filePath;

// const imageUploadUrl = imageUpload.uploadUrl;
// const imageAssetPath = imageUpload.filePath;

// console.log("ASSET PATHS:", videoAssetPath, imageAssetPath);

// await fetch(videoUploadUrl, {
//   method: "PUT",
//   body: fs2.createReadStream(tempVideoPath),
//    headers: {
//     "Content-Type": "video/mp4",
//   },
// });

// await fetch(imageUploadUrl, {
//   method: "PUT",
//   body: fs2.createReadStream(tempImagePath),
//    headers: {
//     "Content-Type": "image/jpeg",
//   },
// });
// 2️⃣ WAIT until Magic Hour processes the uploaded assets
//await new Promise(res => setTimeout(res, 50000));
// console.log("Using assets:", {
//   video: videoUpload.filePath,
//   image: imageUpload.filePath,
// });
 const videolocalPath = path.join(
        __dirname,
        "..",
        "assets",
        "inputvideo.mp4"
      );
      // or temp path if from upload
      const imagelocalPath = path.join(
        __dirname,
        "..",
        "assets",
        "inputimage.jpeg"
      );
  try {
    const res = await client.v1.faceSwap.generate(
      {
        name: `FaceSwap_${Date.now()}`,
        startSeconds: 0.0,
        endSeconds:safeDuration, // 👈 FULL LENGTH
        style: { version: "default" },
        assets: {
          faceMappings: [
            {
                newFace: tempImagePath,
                originalFace: "api-assets/id/0-0.png",
            }
        ],
          videoFilePath: tempVideoPath,
          videoSource: "file", // Must be 'file' or 'youtube'
         faceSwapMode: "all-faces",
          imageFilePath: tempImagePath,
        }
      },
      {
        waitForCompletion: true,
        downloadOutputs: true,
        downloadDirectory: "outputs"
      }
    );

    // 🔹 Magic Hour saves output locally
    // const outputFile = res.outputs?.[0]?.filePath;
    const outputFile = res;
    if (!outputFile) {
      throw new Error("FaceSwap completed but no output file found");
    }
      const response = await axios.get(outputFile.download.url, {
    responseType: "stream",
    timeout: 0, // important for large videos
  });

  // Convert axios stream → Node stream
  const passThrough = new PassThrough();
  response.data.pipe(passThrough);
    // 🔹 Upload result to GridFS
    // const swappedStream = fs2.createReadStream(outputFile);
    const swappedVideoId = await uploadToGridFS(
      `faceswap-${Date.now()}.mp4`,
      passThrough,
      "video/mp4"
    );
    return swappedVideoId;
  } catch (err) {
    // await fs2.unlink(tempVideoPath).catch(() => {});
    throw new Error(`Magic Hour FaceSwap failed: ${err.message}`);
  } 
  // finally {
  //   // 🧹 Cleanup AFTER Magic Hour
  //   await fs2.unlink(tempImagePath).catch(() => {});
  //   await fs2.unlink(tempVideoPath).catch(() => {});
  //   console.log("Temp files cleaned up.");
  // }
}
module.exports = runFaceSwap;
