// utils/videoMerge.js
const ffmpeg = require("fluent-ffmpeg");
const fs = require("fs/promises");
const path = require("path");
const os = require("os");
const { getConnection } = require("../InitDB");
const { Readable } = require("stream");
//const { getConnection, getFileFromGridFS } = require("./gridfs");
async function getFileFromGridFS(fileId) {
  const { bucket } = getConnection();

  return new Promise((resolve, reject) => {
    const chunks = [];
    bucket.openDownloadStream(fileId)
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

/**
 * Save a buffer as a temporary file
 */
const saveTempFile = async (buffer, extension) => {
  const tempFilePath = path.join(
    os.tmpdir(),
    `${Date.now()}-${Math.random().toString(36).slice(2)}.${extension}`
  );

  await fs.writeFile(tempFilePath, buffer);
  return tempFilePath;
};

/**
 * Merge two videos + one audio track into a single MP4
 */
async function mergeTwoVideos({ name, date, type, video1Id, video2Id, audioId,clientPhotoId }) {
  // Get files from GridFS
  const video1Buffer = await getFileFromGridFS(video1Id);
  const video2Buffer = await getFileFromGridFS(video2Id);
  const audioBuffer = await getFileFromGridFS(audioId);
// const clientPhotoBuffer = await getFileFromGridFS(clientPhotoId);
  // Save temp files
  const tempvideo1Path = await saveTempFile(video1Buffer, "mp4");
  const tempvideo2Path = await saveTempFile(video2Buffer, "mp4");
  const tempAudioPath = await saveTempFile(audioBuffer, "mp3");
//const tempClientPhotoPath = await saveTempFile(clientPhotoBuffer, "jpg");
  // Output path
  const outputPath = path.join(os.tmpdir(), `merged-${Date.now()}.mp4`);

  // Run ffmpeg merge
  await new Promise((resolve, reject) => {
    ffmpeg()
      .input(tempvideo1Path)
      .input(tempvideo2Path)
      .input(tempAudioPath)
      .inputOptions(["-stream_loop -1"]) // loop audio
      .complexFilter([
        "[0:v]scale=1080:1920,fps=30,setsar=1[v0]",
        "[1:v]scale=1080:1920,fps=30,setsar=1[v1]",
        "[v0][v1]concat=n=2:v=1:a=0[v]",
      ])
      .outputOptions([
        "-map [v]",
        "-map 2:a",
        "-c:v libx264",
        "-c:a aac",
        "-pix_fmt yuv420p",
        "-shortest",
        "-movflags +faststart",
      ])
      .on("end", resolve)
      .on("error", reject)
      .save(outputPath);
  });

  // Read merged file
  const mergedBuffer = await fs.readFile(outputPath);

  // Upload back to GridFS
  const posterVideoId = await uploadToGridFS(
    `merged-${Date.now()}.mp4`,
    mergedBuffer,
    "video/mp4"
  );

  return posterVideoId;
}

module.exports = {
  mergeTwoVideos,
};
