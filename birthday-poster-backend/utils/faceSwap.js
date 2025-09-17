require("dotenv").config();
const axios = require("axios");
const fs = require("fs/promises");
const fs2 = require("fs");
const path = require("path");
const os = require("os");
const { Readable } = require("stream");
const { getConnection } = require("../InitDB");
const FormData = require("form-data");
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

// Call Segmind FaceSwap
async function runFaceSwap(imagePath, video1Id) {
  if (!imagePath) {
    throw new Error("runFaceSwap: imagePath is undefined");
  }
  if (!fs2.existsSync(imagePath)) {
    throw new Error(`Image file does not exist: ${imagePath}`);
  }

  const api_key = process.env.SEGMENT_API_KEY;
  const url = "https://api.segmind.com/v1/videofaceswap";

  const base64Image = await imageFileToBase64(imagePath);
  // Get input video from GridFS
  const video1Buffer = await getFileFromGridFS(video1Id);
  if (!video1Buffer) {
    throw new Error(`Could not fetch video with id: ${video1Id}`);
  }
  const tempVideoPath = await saveTempFile(video1Buffer, "mp4");
  if (!tempVideoPath) {
    throw new Error("saveTempFile failed to return a path");
  }
  const data = {
    source_img: base64Image,
    video_input:`https://api.bilimbebrandactivations.com/api/upload/file/${video1Id}`,
     input_faces_index: 0,
    source_faces_index: 0,
    face_restore: true,
    face_restore_visibility: 1,
    codeformer_weight: 0.95,
    detect_gender_input: "no",
    detect_gender_source: "no",
    frame_load_cap: 0,
    //base_64: false ,
  };

  try {
    const response = await axios.post(url, data, {
      headers: { "x-api-key": api_key, "Content-Type": "application/json" },
  responseType: "stream",       
maxContentLength: Infinity,
      maxBodyLength: Infinity,
 validateStatus: () => true
    });
const ctype = String(response.headers["content-type"] || "").toLowerCase();
    // Use base64 output from API
  if (response.status >= 200 && response.status < 300 && ctype.startsWith("video/")) {
    // Save to GridFS instead of filesystem
    //const swappedBuffer = Buffer.from(response.data);
    const swappedVideoId = await uploadToGridFS(
      `faceswap-${Date.now()}.mp4`,
      response.data,
      "video/mp4"
    );
    // Cleanup temp video
    await fs.unlink(tempVideoPath).catch(() => {});
  console.log("swappedVideoId", swappedVideoId);
    return swappedVideoId; // return path of processed video
}
  } catch (error) {
    await fs.unlink(tempVideoPath).catch(() => {});
    // Error path: try to surface readable info
  let errText = "";
  try { errText = Buffer.from(response.data).toString("utf8").slice(0, 2000); } catch {}
  throw new Error(`FaceSwap API returned invalid response (status ${response.status}, content-type ${ctype}). Body: ${errText}`);  }
}

module.exports = runFaceSwap;

