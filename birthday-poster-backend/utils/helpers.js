const fs = require("fs").promises;
const path = require("path");
const os = require("os");
const { GridFSBucket } = require("mongodb");
const { Readable } = require("stream");
const mongoose = require("mongoose");
const ffmpeg = require("fluent-ffmpeg");

/**
 * Upload a file buffer to MongoDB GridFS.
 * @param {string} filename - The desired filename to store.
 * @param {Buffer} buffer - The file content as a buffer.
 * @param {string} mimetype - The MIME type of the file.
 * @returns {Promise<ObjectId>} - Returns the ObjectId of the stored file.
 */
async function uploadToGridFSStream(filename, buffer, mimetype) {
  const db = mongoose.connection.db;
  const bucket = new GridFSBucket(db, { bucketName: "media" });

  const readableStream = new Readable();
  readableStream.push(buffer);
  readableStream.push(null); // signal end of stream

  const uploadStream = bucket.openUploadStream(filename, {
    contentType: mimetype,
  });

  return new Promise((resolve, reject) => {
    readableStream
      .pipe(uploadStream)
      .on("error", reject)
      .on("finish", () => resolve(uploadStream.id));
  });
}

/**
 * Save a buffer to a temporary file.
 * @param {Buffer} buffer - File data.
 * @param {string} ext - File extension without dot (e.g., "png", "mp4").
 * @returns {Promise<string>} - Path to the saved file.
 */
async function saveTempFile(buffer, ext) {
  const tempPath = path.join(os.tmpdir(), `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`);
  await fs.writeFile(tempPath, buffer);
  return tempPath;
}

/**
 * Extract metadata (width, height, fps, duration) from a video file.
 * @param {string} filePath - Local path to the video file.
 * @returns {Promise<{ width: number, height: number, fps: number, duration: number }>}
 */
async function getVideoMetadata(filePath) {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(filePath, (err, metadata) => {
      if (err) return reject(err);

      const videoStream = metadata.streams.find(
        (stream) => stream.codec_type === "video"
      );
      if (!videoStream) {
        return reject(new Error("No video stream found in the file."));
      }

      // Extract FPS safely: e.g., "25/1" or "30000/1001"
      let fps = 25; // default fallback
      try {
        const [num, den] = videoStream.r_frame_rate.split("/").map(Number);
        fps = num / den;
      } catch (e) {
        console.warn("Failed to parse FPS:", e.message);
      }

      resolve({
        width: videoStream.width,
        height: videoStream.height,
        fps,
        duration: metadata.format.duration || 0,
      });
    });
  });
}

module.exports = {
  uploadToGridFSStream,
  saveTempFile,
  getVideoMetadata,
};
