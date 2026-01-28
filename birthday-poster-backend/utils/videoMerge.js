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
 * Extract audio from a video file or return the audio file as-is
 * @param {Buffer} buffer - File buffer (can be video or audio)
 * @param {string} originalExtension - Original file extension
 * @returns {Promise<Buffer>} - Audio buffer in MP3 format
 */
const extractAudioFromVideo = async (buffer, originalExtension) => {
  // Check if it's a video file
  const isVideo = ['mp4', 'avi', 'mov', 'mkv', 'webm', 'flv', 'wmv', 'm4v'].includes(originalExtension.toLowerCase());
  
  if (!isVideo) {
    // It's already an audio file, return as-is
    return buffer;
  }
  
  // Save video to temp file
  const tempVideoPath = await saveTempFile(buffer, originalExtension);
  const tempAudioPath = path.join(os.tmpdir(), `extracted-audio-${Date.now()}.mp3`);
  
  try {
    // Extract audio using ffmpeg
    await new Promise((resolve, reject) => {
      ffmpeg(tempVideoPath)
        .outputOptions([
          '-vn', // No video
          '-acodec', 'libmp3lame', // MP3 codec
          '-ab', '192k', // Audio bitrate
          '-ar', '44100', // Sample rate
          '-y' // Overwrite output file
        ])
        .output(tempAudioPath)
        .on('end', resolve)
        .on('error', reject)
        .run();
    });
    
    // Read extracted audio
    const audioBuffer = await fs.readFile(tempAudioPath);
    
    // Cleanup temp files
    await fs.unlink(tempVideoPath).catch(() => {});
    await fs.unlink(tempAudioPath).catch(() => {});
    
    return audioBuffer;
  } catch (error) {
    // Cleanup on error
    await fs.unlink(tempVideoPath).catch(() => {});
    await fs.unlink(tempAudioPath).catch(() => {});
    throw new Error(`Failed to extract audio from video: ${error.message}`);
  }
};

/**
 * Merge two videos + one audio track into a single MP4
 */
async function mergeTwoVideos({
  name,
  date,
  type,
  video1Id,
  video2Id,
  audioId,
  clientPhotoId,
}) {
  // Get files from GridFS
  const video1Buffer = await getFileFromGridFS(video1Id);
  const video2Buffer = await getFileFromGridFS(video2Id);
  // const clientPhotoBuffer = await getFileFromGridFS(clientPhotoId);
  // Save temp files
  const tempvideo1Path = await saveTempFile(video1Buffer, "mp4");
  const tempvideo2Path = await saveTempFile(video2Buffer, "mp4");
  //const tempClientPhotoPath = await saveTempFile(clientPhotoBuffer, "jpg");
  
  // Handle optional audio
  let tempAudioPath = null;
  if (audioId) {
    const audioBuffer = await getFileFromGridFS(audioId);
    tempAudioPath = await saveTempFile(audioBuffer, "mp3");
  }
  
  // Output path
  const outputPath = path.join(os.tmpdir(), `merged-${Date.now()}.mp4`);

  // Run ffmpeg merge
  await new Promise((resolve, reject) => {
    const ffmpegCmd = ffmpeg()
      .input(tempvideo1Path)
      .input(tempvideo2Path);
    
    // Add audio input if available
    if (tempAudioPath) {
      ffmpegCmd.input(tempAudioPath).inputOptions(["-stream_loop -1"]); // loop audio
    }
    
    ffmpegCmd
      .complexFilter([
        "[0:v]scale=1080:1920,fps=30,setsar=1[v0]",
        "[1:v]scale=1080:1920,fps=30,setsar=1[v1]",
        "[v0][v1]concat=n=2:v=1:a=0[v]",
      ])
      .outputOptions([
        "-map [v]",
        ...(tempAudioPath ? ["-map 2:a", "-c:a aac"] : ["-an"]), // Add audio if available, otherwise no audio
        "-c:v libx264",
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

  // Cleanup temp files
  try {
    if (tempAudioPath) {
      await fs.unlink(tempAudioPath);
    }
  } catch (cleanupErr) {
    console.warn("Failed to cleanup temp audio file:", cleanupErr);
  }

  return posterVideoId;
}
//------>working fine code 
// async function mergeThreeVideos({
//   name,
//   date,
//   type,
//   video1Id,
//   video2Id,
//   video3Id,
//   audioId,
//   clientname,
//   brandname,
//   congratsOption,
//   clientPhotoId,
// }) {
//   const video1Buffer = await getFileFromGridFS(video1Id);
//   const video2Buffer = await getFileFromGridFS(video2Id);
//   const video3Buffer = await getFileFromGridFS(video3Id);
//   const audioBuffer = await getFileFromGridFS(audioId);

//   const tempvideo1Path = await saveTempFile(video1Buffer, "mp4");
//   const tempvideo2Path = await saveTempFile(video2Buffer, "mp4");
//   const tempvideo3Path = await saveTempFile(video3Buffer, "mp4");
//   const tempAudioPath = await saveTempFile(audioBuffer, "mp3");

//   const outputPath = path.join(os.tmpdir(), `merged-${Date.now()}.mp4`);

//   // Font & styling
//   const fontColor = "white";
//   const bgColor = "red";
//   const fontSizeName = 76;
//   const fontSizeBrand = 54;
//   const textX = 40; // Keep text aligned to left with some padding
//   const animDuration = 0.8; // fade + slide animation duration

//   // Escape helper
//   function escapeFFmpegText(txt = "") {
//     return String(txt).replace(/\\/g, "\\\\").replace(/'/g, "\\'");
//   }

//   // Calculate vertical positions for left-center alignment
//   // We'll position text in the left-center region, slightly below actual center
//   const centerLine = 1920 / 2; // Vertical center (since video is 1080x1920)
//   const nameY = centerLine + 500; // 100px below center for client name
//   const brandY = nameY + 100; // 100px below client name for brand

//   // Drawtext for client name (left side center)
//   function drawTextName(txt, fontSize) {
//     const esc = escapeFFmpegText(txt);
//     return `drawtext=font='Arial-Bold':text='${esc}':fontcolor=${fontColor}:fontsize=${fontSize}:x=${textX}:` +
//       `y=${nameY}-(50*min(t/${animDuration}\\,1)):` + // Animate from below
//       `alpha=if(lt(t\\,${animDuration})\\, t/${animDuration}\\, 1)`;
//   }

//   // Drawtext for brand name (left side, below client name)
//   function drawTextBrand(txt, fontSize) {
//     const esc = escapeFFmpegText(txt);
//     return `drawtext=font='Arial-Bold':text='${esc}':fontcolor=${fontColor}:fontsize=${fontSize}:x=${textX}:` +
//       `y=${brandY}-(50*min(t/${animDuration}\\,1)):` + // Animate from below
//       `alpha=if(lt(t\\,${animDuration})\\, t/${animDuration}\\, 1)`;
//   }

//   // Build filter array
//   const filters = [
//     `[0:v]scale=1080:1920,fps=30,setsar=1,${drawTextName(clientname, fontSizeName)}[v0]`,
//     `[1:v]scale=1080:1920,fps=30,setsar=1,${drawTextName(clientname, fontSizeName)},${drawTextBrand(brandname, fontSizeBrand)}[v1]`,
//     `[2:v]scale=1080:1920,fps=30,setsar=1,${drawTextName(clientname, fontSizeName)},${drawTextBrand(brandname, fontSizeBrand)}[v2]`
//   ];

//   if (congratsOption) {
//     const congratsDuration = 3;
//     const line1 = escapeFFmpegText("Congratulations");
//     const line2 = escapeFFmpegText(clientname);
//     const anim = animDuration;

//     filters.push(
//       `color=c=red:s=1080x1920:d=${congratsDuration}[congratsbg]`,
//       `[congratsbg]drawtext=text='${line1}':font=Arial:fontcolor=white:fontsize=90:x=(w-text_w)/2:` +
//         `y=h/2-text_h-60+200-(200*min(t/${anim}\\,1)):` +
//         `alpha=if(lt(t\\,${anim})\\, t/${anim}\\, 1)[cg1]`,
//       `[cg1]drawtext=text='${line2}':font=Arial:fontcolor=white:fontsize=80:x=(w-text_w)/2:` +
//         `y=h/2+40+200-(200*min(t/${anim}\\,1)):` +
//         `alpha=if(lt(t\\,${anim})\\, t/${anim}\\, 1)[v3]`,
//       `[v0][v1][v2][v3]concat=n=4:v=1:a=0[v]`
//     );
//   } else {
//     filters.push(`[v0][v1][v2]concat=n=3:v=1:a=0[v]`);
//   }

//   await new Promise((resolve, reject) => {
//     const cmd = ffmpeg()
//       .input(tempvideo1Path)
//       .input(tempvideo2Path)
//       .input(tempvideo3Path)
//       .input(tempAudioPath)
//       .inputOptions(["-stream_loop", "-1"])
//       .complexFilter(filters)
//       .outputOptions([
//         "-map [v]",
//         "-map 3:a",
//         "-c:v libx264",
//         "-c:a aac",
//         "-pix_fmt yuv420p",
//         "-movflags +faststart",
//         "-shortest"
//       ])
//       .on("end", resolve)
//       .on("error", (err, stdout, stderr) => {
//         const e = new Error("ffmpeg error: " + err.message + "\n" + stderr);
//         reject(e);
//       })
//       .save(outputPath);
//   });

//   console.log("outputPath", outputPath);

//   const mergedBuffer = await fs.readFile(outputPath);
//   const posterVideoId = await uploadToGridFS(
//     `merged-${Date.now()}.mp4`,
//     mergedBuffer,
//     "video/mp4"
//   );

//   return posterVideoId;
// }
//working fine with text overlay options
// async function mergeThreeVideos({
//   name,
//   date,
//   type,
//   video1Id,
//   video2Id,
//   video3Id,
//   audioId,
//   clientname,
//   brandname,
//   congratsOption,
//   video1TextOption,
//   video2TextOption,
//   video3TextOption,
//   clientPhotoId,
// }) {
//   const video1Buffer = await getFileFromGridFS(video1Id);
//   const video2Buffer = await getFileFromGridFS(video2Id);
//   const video3Buffer = await getFileFromGridFS(video3Id);
//   const audioBuffer = await getFileFromGridFS(audioId);

//   const tempvideo1Path = await saveTempFile(video1Buffer, "mp4");
//   const tempvideo2Path = await saveTempFile(video2Buffer, "mp4");
//   const tempvideo3Path = await saveTempFile(video3Buffer, "mp4");
//   const tempAudioPath = await saveTempFile(audioBuffer, "mp3");

//   const outputPath = path.join(os.tmpdir(), `merged-${Date.now()}.mp4`);

//   // Modern text styling
//   const fontSizeName = 80;
//   const fontSizeBrand = 60;
//   const textXStart = -400;
//   const textXEnd = 60;
//   const animDuration = 1.0;
//   const lineSpacing = 90;

//   // Text styling
//   const textColor = "white";
//   const shadowColor = "black@0.6";
//   const shadowX = 3;
//   const shadowY = 3;
//   const textOpacity = 0.95;

//   // Calculate vertical positions for left-center
//   const centerLine = 1920 / 2;
//   const nameY = centerLine - 30;
//   const brandY = nameY + lineSpacing;

//   // Simple escape function
//   function escapeFFmpegText(txt = "") {
//     return String(txt).replace(/:/g, '\\:').replace(/'/g, "\\'").replace(/\\/g, "\\\\");
//   }

//   const clientName = escapeFFmpegText(clientname);
//   const brandName = escapeFFmpegText(brandname);

//   // Helper function to build text with shadow effect
//   function buildTextFilter(showText) {
//     if (!showText) {
//       return ""; // Return empty string if no text should be shown
//     }

//     const slideInX = `if(lt(t\\,${animDuration})\\, ${textXStart}+(t/${animDuration})*(${textXEnd}-${textXStart})\\, ${textXEnd})`;
//     const alpha = `alpha=if(lt(t\\,${animDuration})\\, t/${animDuration}\\, 1)*${textOpacity}`;

//     // Client name with shadow
//     let filter = `drawtext=text='${clientName}':fontcolor=${shadowColor}:fontsize=${fontSizeName}:` +
//       `x=${slideInX}+${shadowX}:y=${nameY}+${shadowY}:${alpha},` +
//       `drawtext=text='${clientName}':fontcolor=${textColor}:fontsize=${fontSizeName}:` +
//       `x=${slideInX}:y=${nameY}:${alpha}`;

//     // Brand name with shadow (appears slightly after client name)
//     filter += `,drawtext=text='${brandName}':fontcolor=${shadowColor}:fontsize=${fontSizeBrand}:` +
//       `x=${slideInX}+${shadowX}:y=${brandY}+${shadowY}:` +
//       `alpha=if(lt(t\\,${animDuration}-0.2)\\, max(0\\, (t-0.2)/${animDuration})\\, 1)*${textOpacity},` +
//       `drawtext=text='${brandName}':fontcolor=${textColor}:fontsize=${fontSizeBrand}:` +
//       `x=${slideInX}:y=${brandY}:` +
//       `alpha=if(lt(t\\,${animDuration}-0.2)\\, max(0\\, (t-0.2)/${animDuration})\\, 1)*${textOpacity}`;

//     return filter;
//   }

//   // Helper function to build filter for each video based on text option
//   function buildVideoFilter(videoIndex, showText) {
//     const input = `[${videoIndex}:v]`;
//     const output = `[v${videoIndex}]`;

//     const baseFilter = `scale=1080:1920:force_original_aspect_ratio=decrease,` +
//       `pad=1080:1920:(ow-iw)/2:(oh-ih)/2,setsar=1,fps=30`;

//     let filter = input + baseFilter;

//     // Add text filter only if showText is true
//     if (showText) {
//       const textFilter = buildTextFilter(showText);
//       if (textFilter) {
//         filter += `,${textFilter}`;
//       }
//     }

//     return filter + output;
//   }

//   // Build filter array
//   const filters = [];

//   // FIX: Handle string values like 'true' and 'false'
//   // Convert string values to proper booleans
//   const showText1 = video1TextOption === undefined ? true : 
//                    video1TextOption === true || video1TextOption === 'true';

//   const showText2 = video2TextOption === undefined ? true : 
//                    video2TextOption === true || video2TextOption === 'true';

//   const showText3 = video3TextOption === undefined ? true : 
//                    video3TextOption === true || video3TextOption === 'true';

//   console.log("Text Options:", { 
//     video1TextOption, 
//     video2TextOption, 
//     video3TextOption,
//     showText1, 
//     showText2, 
//     showText3 
//   });

//   filters.push(buildVideoFilter(0, showText1));
//   filters.push(buildVideoFilter(1, showText2));
//   filters.push(buildVideoFilter(2, showText3));

//   if (congratsOption) {
//     const congratsDuration = 4;
//     const line1 = escapeFFmpegText("CONGRATULATIONS");
//     const line2 = escapeFFmpegText(clientname);
//     const congratsFontSize1 = 100;
//     const congratsFontSize2 = 120;

//     // Use simple color names that FFmpeg understands
//     const congratsBgColor = "darkred";
//     const congratsGoldColor = "yellow";
//     const clientNameColor = "white";

//     filters.push(
//       // Create solid background for congratulations
//       `color=c=${congratsBgColor}:s=1080x1920:d=${congratsDuration}[congratsbg]`,

//       // Congratulations text - YELLOW/GOLD
//       `[congratsbg]drawtext=text='${line1}':fontcolor=black:fontsize=${congratsFontSize1}:` +
//       `x=(w-text_w)/2+3:y=h/2-180+3:enable='between(t,0,${congratsDuration})'[cg1shadow]`,

//       `[cg1shadow]drawtext=text='${line1}':fontcolor=${congratsGoldColor}:fontsize=${congratsFontSize1}:` +
//       `x=(w-text_w)/2:y=h/2-180:enable='between(t,0,${congratsDuration})'[cg1]`,

//       // Client name - BIG and WHITE
//       `[cg1]drawtext=text='${line2}':fontcolor=black:fontsize=${congratsFontSize2}:` +
//       `x=(w-text_w)/2+4:y=h/2+4:enable='between(t,0,${congratsDuration})'[cg2shadow]`,

//       `[cg2shadow]drawtext=text='${line2}':fontcolor=${clientNameColor}:fontsize=${congratsFontSize2}:` +
//       `x=(w-text_w)/2:y=h/2:enable='between(t,0,${congratsDuration})'[v3]`
//     );

//     // Concatenate all videos
//     filters.push(`[v0][v1][v2][v3]concat=n=4:v=1:a=0[v]`);
//   } else {
//     // Concatenate only the three videos
//     filters.push(`[v0][v1][v2]concat=n=3:v=1:a=0[v]`);
//   }

//   await new Promise((resolve, reject) => {
//     // Build the ffmpeg command
//     let cmd = ffmpeg()
//       .input(tempvideo1Path)
//       .input(tempvideo2Path)
//       .input(tempvideo3Path)
//       .input(tempAudioPath)
//       .inputOptions(["-stream_loop", "-1"]);

//     // Add complex filter
//     cmd = cmd.complexFilter(filters);

//     // Add output options with better quality
//     cmd = cmd.outputOptions([
//       "-map [v]",
//       "-map 3:a",
//       "-c:v libx264",
//       "-preset medium",
//       "-crf 22",
//       "-c:a aac",
//       "-b:a 192k",
//       "-pix_fmt yuv420p",
//       "-movflags +faststart",
//       "-shortest"
//     ]);

//     cmd = cmd.output(outputPath)
//       .on("start", (commandLine) => {
//         console.log("FFmpeg command started");
//       })
//       .on("end", () => {
//         console.log("Merge completed successfully");
//         resolve();
//       })
//       .on("error", (err, stdout, stderr) => {
//         console.error("FFmpeg stderr:", stderr);
//         const e = new Error("ffmpeg error: " + err.message);
//         reject(e);
//       })
//       .run();
//   });

//   console.log("Output path:", outputPath);

//   const mergedBuffer = await fs.readFile(outputPath);
//   const posterVideoId = await uploadToGridFS(
//     `merged-${Date.now()}.mp4`,
//     mergedBuffer,
//     "video/mp4"
//   );

//   // Cleanup temp files
//   try {
//     await fs.unlink(tempvideo1Path);
//     await fs.unlink(tempvideo2Path);
//     await fs.unlink(tempvideo3Path);
//     await fs.unlink(tempAudioPath);
//     await fs.unlink(outputPath);
//   } catch (cleanupErr) {
//     console.warn("Failed to cleanup temp files:", cleanupErr);
//   }

//   return posterVideoId;
// }

// async function mergeThreeVideos({
//   name,
//   date,
//   type,
//   video1Id,
//   video2Id,
//   video3Id,
//   audioId,
//   clientname,
//   brandname,
//   congratsOption,
//   video1TextOption,
//   video2TextOption,
//   video3TextOption,
//   clientPhotoId,
// }) {
//   const video1Buffer = await getFileFromGridFS(video1Id);
//   const video2Buffer = await getFileFromGridFS(video2Id);
//   const video3Buffer = await getFileFromGridFS(video3Id);
//   const audioBuffer = await getFileFromGridFS(audioId);

//   const tempvideo1Path = await saveTempFile(video1Buffer, "mp4");
//   const tempvideo2Path = await saveTempFile(video2Buffer, "mp4");
//   const tempvideo3Path = await saveTempFile(video3Buffer, "mp4");
//   const tempAudioPath = await saveTempFile(audioBuffer, "mp3");

//   const outputPath = path.join(os.tmpdir(), `merged-${Date.now()}.mp4`);

//   // Modern text styling
//   const fontSizeName = 80;
//   const fontSizeBrand = 60;
//   const textXStart = -400;
//   const textXEnd = 60;
//   const animDuration = 1.0;
//   const lineSpacing = 90;

//   // Text styling
//   const textColor = "white";
//   const shadowColor = "black@0.6";
//   const shadowX = 3;
//   const shadowY = 3;
//   const textOpacity = 0.95;

//   // Calculate vertical positions for left-center
//   const centerLine = 1920 / 2;
//   const nameY = centerLine - 500;
//   const brandY = nameY + lineSpacing;

//   // Simple escape function
//   function escapeFFmpegText(txt = "") {
//     return String(txt).replace(/:/g, '\\:').replace(/'/g, "\\'").replace(/\\/g, "\\\\");
//   }

//   const clientName = escapeFFmpegText(clientname);
//   const brandName = escapeFFmpegText(brandname);

//   // Helper function to build text with shadow effect
//   function buildTextFilter(showText) {
//     if (!showText) {
//       return ""; // Return empty string if no text should be shown
//     }

//     const slideInX = `if(lt(t\\,${animDuration})\\, ${textXStart}+(t/${animDuration})*(${textXEnd}-${textXStart})\\, ${textXEnd})`;
//     const alpha = `alpha=if(lt(t\\,${animDuration})\\, t/${animDuration}\\, 1)*${textOpacity}`;

//     // Client name with shadow
//     let filter = `drawtext=text='${clientName}':fontcolor=${shadowColor}:fontsize=${fontSizeName}:` +
//       `x=${slideInX}+${shadowX}:y=${nameY}+${shadowY}:${alpha},` +
//       `drawtext=text='${clientName}':fontcolor=${textColor}:fontsize=${fontSizeName}:` +
//       `x=${slideInX}:y=${nameY}:${alpha}`;

//     // Brand name with shadow (appears slightly after client name)
//     filter += `,drawtext=text='${brandName}':fontcolor=${shadowColor}:fontsize=${fontSizeBrand}:` +
//       `x=${slideInX}+${shadowX}:y=${brandY}+${shadowY}:` +
//       `alpha=if(lt(t\\,${animDuration}-0.2)\\, max(0\\, (t-0.2)/${animDuration})\\, 1)*${textOpacity},` +
//       `drawtext=text='${brandName}':fontcolor=${textColor}:fontsize=${fontSizeBrand}:` +
//       `x=${slideInX}:y=${brandY}:` +
//       `alpha=if(lt(t\\,${animDuration}-0.2)\\, max(0\\, (t-0.2)/${animDuration})\\, 1)*${textOpacity}`;

//     return filter;
//   }

//   // Helper function to build filter for each video based on text option
//   function buildVideoFilter(videoIndex, showText) {
//     const input = `[${videoIndex}:v]`;
//     const output = `[v${videoIndex}]`;

//     const baseFilter = `scale=1080:1920:force_original_aspect_ratio=decrease,` +
//       `pad=1080:1920:(ow-iw)/2:(oh-ih)/2,setsar=1,fps=30`;

//     let filter = input + baseFilter;

//     // Add text filter only if showText is true
//     if (showText) {
//       const textFilter = buildTextFilter(showText);
//       if (textFilter) {
//         filter += `,${textFilter}`;
//       }
//     }

//     return filter + output;
//   }

//   // Build filter array
//   const filters = [];

//   // Handle string values like 'true' and 'false'
//   const showText1 = video1TextOption === undefined ? true : 
//                    video1TextOption === true || video1TextOption === 'true';

//   const showText2 = video2TextOption === undefined ? true : 
//                    video2TextOption === true || video2TextOption === 'true';

//   const showText3 = video3TextOption === undefined ? true : 
//                    video3TextOption === true || video3TextOption === 'true';

//   filters.push(buildVideoFilter(0, showText1));
//   filters.push(buildVideoFilter(1, showText2));
//   filters.push(buildVideoFilter(2, showText3));

//   // Calculate approximate total duration for fade-out
//   // Let's get the durations of each video first
//   const getVideoDuration = (filePath) => {
//     return new Promise((resolve, reject) => {
//       ffmpeg.ffprobe(filePath, (err, metadata) => {
//         if (err) {
//           reject(err);
//           return;
//         }
//         resolve(metadata.format.duration);
//       });
//     });
//   };

//   try {
//     // Get durations of each video
//     const duration1 = await getVideoDuration(tempvideo1Path);
//     const duration2 = await getVideoDuration(tempvideo2Path);
//     const duration3 = await getVideoDuration(tempvideo3Path);

//     let totalDuration = duration1 + duration2 + duration3;
//     if (congratsOption) {
//       totalDuration += 5; // Add congratulations duration
//     }

//     //console.log(`Video durations: ${duration1.toFixed(2)}s + ${duration2.toFixed(2)}s + ${duration3.toFixed(2)}s = ${totalDuration.toFixed(2)}s`);

//     // Add congratulations if needed
//     if (congratsOption) {
//       const congratsDuration = 5;
//       const line1 = escapeFFmpegText("CONGRATULATIONS");
//       const line2 = escapeFFmpegText(clientname);
//       const congratsFontSize1 = 100;
//       const congratsFontSize2 = 120;

//       // Use simple color names that FFmpeg understands
//       const congratsBgColor = "darkred";
//       const congratsGoldColor = "yellow";
//       const clientNameColor = "white";

//       filters.push(
//         // Create solid background for congratulations
//         `color=c=${congratsBgColor}:s=1080x1920:d=${congratsDuration}[congratsbg]`,

//         // Congratulations text - YELLOW/GOLD
//         `[congratsbg]drawtext=text='${line1}':fontcolor=black:fontsize=${congratsFontSize1}:` +
//         `x=(w-text_w)/2+3:y=h/2-180+3:enable='between(t,0,${congratsDuration})'[cg1shadow]`,

//         `[cg1shadow]drawtext=text='${line1}':fontcolor=${congratsGoldColor}:fontsize=${congratsFontSize1}:` +
//         `x=(w-text_w)/2:y=h/2-180:enable='between(t,0,${congratsDuration})'[cg1]`,

//         // Client name - BIG and WHITE
//         `[cg1]drawtext=text='${line2}':fontcolor=black:fontsize=${congratsFontSize2}:` +
//         `x=(w-text_w)/2+4:y=h/2+4:enable='between(t,0,${congratsDuration})'[cg2shadow]`,

//         `[cg2shadow]drawtext=text='${line2}':fontcolor=${clientNameColor}:fontsize=${congratsFontSize2}:` +
//         `x=(w-text_w)/2:y=h/2:enable='between(t,0,${congratsDuration})'[v3]`
//       );

//       // Concatenate all videos
//       filters.push(`[v0][v1][v2][v3]concat=n=4:v=1:a=0[vout]`);
//     } else {
//       // Concatenate only the three videos
//       filters.push(`[v0][v1][v2]concat=n=3:v=1:a=0[vout]`);
//     }

//     // Calculate fade start time (start fading 2 seconds before end)
//     const fadeStart = Math.max(0, totalDuration - 2);
//     //console.log(`Will apply audio fade-out starting at ${fadeStart.toFixed(2)}s`);

//     // Now do the merge in a single pass with estimated fade timing
//     await new Promise((resolve, reject) => {
//       //console.log("Starting single-pass merge with audio fade-out...");

//       let cmd = ffmpeg()
//         .input(tempvideo1Path)
//         .input(tempvideo2Path)
//         .input(tempvideo3Path)
//         .input(tempAudioPath)
//         .inputOptions(["-stream_loop", "-1"])
//         .complexFilter(filters)
//         .outputOptions([
//           "-map [vout]",
//           "-map 3:a",
//           "-c:v libx264",
//           "-preset fast", // Use faster preset
//           "-crf 24",
//           "-c:a aac",
//           "-b:a 128k", // Lower bitrate for faster processing
//           "-pix_fmt yuv420p",
//           "-movflags +faststart",
//           "-shortest"
//         ])
//         .audioFilters(`afade=t=out:st=${fadeStart}:d=2`)
//         .output(outputPath)
//         .on("start", (commandLine) => {
//           console.log("FFmpeg command started");
//         })
//         .on("progress", (progress) => {
//           if (progress.percent) {
//             //console.log(`Processing: ${progress.percent.toFixed(2)}%`);
//           }
//         })
//         .on("end", () => {
//           //console.log("Merge completed successfully");
//           resolve();
//         })
//         .on("error", (err, stdout, stderr) => {
//           console.error("FFmpeg stderr:", stderr);
//           const e = new Error("ffmpeg error: " + err.message);
//           reject(e);
//         })
//         .run();
//     });

//   } catch (durationError) {
//     console.warn("Could not get video durations, using fallback approach:", durationError.message);

//     // Fallback: Use a simpler approach without precise timing
//     if (congratsOption) {
//       const congratsDuration = 4;
//       const line1 = escapeFFmpegText("CONGRATULATIONS");
//       const line2 = escapeFFmpegText(clientname);
//       const congratsFontSize1 = 100;
//       const congratsFontSize2 = 120;

//       const congratsBgColor = "darkred";
//       const congratsGoldColor = "yellow";
//       const clientNameColor = "white";

//       filters.push(
//         `color=c=${congratsBgColor}:s=1080x1920:d=${congratsDuration}[congratsbg]`,
//         `[congratsbg]drawtext=text='${line1}':fontcolor=black:fontsize=${congratsFontSize1}:` +
//         `x=(w-text_w)/2+3:y=h/2-180+3:enable='between(t,0,${congratsDuration})'[cg1shadow]`,
//         `[cg1shadow]drawtext=text='${line1}':fontcolor=${congratsGoldColor}:fontsize=${congratsFontSize1}:` +
//         `x=(w-text_w)/2:y=h/2-180:enable='between(t,0,${congratsDuration})'[cg1]`,
//         `[cg1]drawtext=text='${line2}':fontcolor=black:fontsize=${congratsFontSize2}:` +
//         `x=(w-text_w)/2+4:y=h/2+4:enable='between(t,0,${congratsDuration})'[cg2shadow]`,
//         `[cg2shadow]drawtext=text='${line2}':fontcolor=${clientNameColor}:fontsize=${congratsFontSize2}:` +
//         `x=(w-text_w)/2:y=h/2:enable='between(t,0,${congratsDuration})'[v3]`
//       );
//       filters.push(`[v0][v1][v2][v3]concat=n=4:v=1:a=0[vout]`);
//     } else {
//       filters.push(`[v0][v1][v2]concat=n=3:v=1:a=0[vout]`);
//     }

//     // Fallback: Use simpler approach without fade timing
//     await new Promise((resolve, reject) => {
//       //console.log("Starting fallback merge (no audio fade-out)...");

//       let cmd = ffmpeg()
//         .input(tempvideo1Path)
//         .input(tempvideo2Path)
//         .input(tempvideo3Path)
//         .input(tempAudioPath)
//         .inputOptions(["-stream_loop", "-1"])
//         .complexFilter(filters)
//         .outputOptions([
//           "-map [vout]",
//           "-map 3:a",
//           "-c:v libx264",
//           "-preset fast",
//           "-crf 24",
//           "-c:a aac",
//           "-b:a 128k",
//           "-pix_fmt yuv420p",
//           "-movflags +faststart",
//           "-shortest"
//         ])
//         .output(outputPath)
//         .on("start", (commandLine) => {
//           //console.log("FFmpeg command started");
//         })
//         .on("progress", (progress) => {
//           if (progress.percent) {
//             //console.log(`Processing: ${progress.percent.toFixed(2)}%`);
//           }
//         })
//         .on("end", () => {
//           //console.log("Merge completed successfully (no fade-out)");
//           resolve();
//         })
//         .on("error", (err, stdout, stderr) => {
//           console.error("FFmpeg stderr:", stderr);
//           const e = new Error("ffmpeg error: " + err.message);
//           reject(e);
//         })
//         .run();
//     });
//   }

//   //console.log("Output path:", outputPath);

//   const mergedBuffer = await fs.readFile(outputPath);
//   const posterVideoId = await uploadToGridFS(
//     `merged-${Date.now()}.mp4`,
//     mergedBuffer,
//     "video/mp4"
//   );

//   // Cleanup temp files
//   try {
//     await fs.unlink(tempvideo1Path);
//     await fs.unlink(tempvideo2Path);
//     await fs.unlink(tempvideo3Path);
//     await fs.unlink(tempAudioPath);
//     await fs.unlink(outputPath);
//   } catch (cleanupErr) {
//     console.warn("Failed to cleanup temp files:", cleanupErr);
//   }

//   return posterVideoId;
// }
//full corrected code 3 video
async function mergeThreeVideos({
  name,
  date,
  type,
  video1Id,
  video2Id,
  video3Id,
  audioId,
  clientname,
  brandname,
  congratsOption,
  video1TextOption,
  video2TextOption,
  video3TextOption,
  clientPhotoId,
  gifId,
  textColor = 'white',
  fontFamily = 'Arial',
}) {
  const video1Buffer = await getFileFromGridFS(video1Id);
  const video2Buffer = await getFileFromGridFS(video2Id);
  const video3Buffer = await getFileFromGridFS(video3Id);

  const tempvideo1Path = await saveTempFile(video1Buffer, "mp4");
  const tempvideo2Path = await saveTempFile(video2Buffer, "mp4");
  const tempvideo3Path = await saveTempFile(video3Buffer, "mp4");
  
  // Handle optional audio
  let tempAudioPath = null;
  if (audioId) {
    const audioBuffer = await getFileFromGridFS(audioId);
    tempAudioPath = await saveTempFile(audioBuffer, "mp3");
  }

  // Handle GIF animation - only for middle video (video2)
  let tempGifPath = null;
  if (gifId) {
    const gifBuffer = await getFileFromGridFS(gifId);
    tempGifPath = await saveTempFile(gifBuffer, "gif");
  }

  const outputPath = path.join(os.tmpdir(), `merged-${Date.now()}.mp4`);

  // Modern text styling
  const fontSizeName = 80;
  const fontSizeBrand = 60;
  const textXStart = -400;
  const textXEnd = 60;
  const animDuration = 1.0;
  const lineSpacing = 90;
  
  // Text styling - use provided values or defaults
  // Convert hex color to FFmpeg format (0xRRGGBB) or use color name
  let overlayTextColor = textColor || "white";
  if (overlayTextColor.startsWith('#')) {
    // Convert #RRGGBB to 0xRRGGBB format for FFmpeg
    overlayTextColor = '0x' + overlayTextColor.substring(1).toUpperCase();
  }
  const overlayFontFamily = fontFamily || "Arial";
  const shadowColor = "black@0.6";
  const shadowX = 3;
  const shadowY = 3;
  const textOpacity = 0.95;

  // Calculate vertical positions for left-center
  const centerLine = 1920 / 2;
  const nameY = centerLine + 500;
  const brandY = nameY + lineSpacing;

  // Simple escape function
  function escapeFFmpegText(txt = "") {
    return String(txt).replace(/:/g, '\\:').replace(/'/g, "\\'").replace(/\\/g, "\\\\");
  }

  const clientName = escapeFFmpegText(clientname);
  const brandName = escapeFFmpegText(brandname);

  // Helper function to build text with glow effect (multiple shadow layers)
  function buildTextFilter(showText) {
    if (!showText) {
      return ""; // Return empty string if no text should be shown
    }

    const slideInX = `if(lt(t\\,${animDuration})\\, ${textXStart}+(t/${animDuration})*(${textXEnd}-${textXStart})\\, ${textXEnd})`;
    const alpha = `alpha=if(lt(t\\,${animDuration})\\, t/${animDuration}\\, 1)*${textOpacity}`;
    const brandAlpha = `alpha=if(lt(t\\,${animDuration}-0.2)\\, max(0\\, (t-0.2)/${animDuration})\\, 1)*${textOpacity}`;
    
    // Create glow effect with multiple shadow layers
    // Layer 1: Outer glow (largest, most transparent)
    // Layer 2: Middle glow
    // Layer 3: Inner shadow
    // Layer 4: Main text
    
    // Client name with glow effect - Using configurable font
    let filter = '';
    
    // Outer glow layers for client name (creates soft glow)
    const glowOffsets = [
      { x: 0, y: 0, opacity: 0.3 },
      { x: 2, y: 2, opacity: 0.25 },
      { x: -2, y: 2, opacity: 0.25 },
      { x: 2, y: -2, opacity: 0.25 },
      { x: -2, y: -2, opacity: 0.25 },
      { x: 4, y: 0, opacity: 0.2 },
      { x: -4, y: 0, opacity: 0.2 },
      { x: 0, y: 4, opacity: 0.2 },
      { x: 0, y: -4, opacity: 0.2 }
    ];
    
    // Draw glow layers for client name
    glowOffsets.forEach((offset, idx) => {
      filter += `drawtext=text='${clientName}':fontcolor=black@${offset.opacity}:fontsize=${fontSizeName}:` +
        `font='${overlayFontFamily}':x=${slideInX}+${offset.x}:y=${nameY}+${offset.y}:${alpha}`;
      if (idx < glowOffsets.length - 1 || true) filter += ',';
    });
    
    // Main shadow for client name
    filter += `drawtext=text='${clientName}':fontcolor=black@0.7:fontsize=${fontSizeName}:` +
      `font='${overlayFontFamily}':x=${slideInX}+${shadowX}:y=${nameY}+${shadowY}:${alpha},`;
    
    // Main text for client name
    filter += `drawtext=text='${clientName}':fontcolor=${overlayTextColor}:fontsize=${fontSizeName}:` +
      `font='${overlayFontFamily}':x=${slideInX}:y=${nameY}:${alpha}`;
    
    // Brand name with glow effect
    // Draw glow layers for brand name
    glowOffsets.forEach((offset, idx) => {
      filter += `,drawtext=text='${brandName}':fontcolor=black@${offset.opacity}:fontsize=${fontSizeBrand}:` +
        `font='${overlayFontFamily}':x=${slideInX}+${offset.x}:y=${brandY}+${offset.y}:${brandAlpha}`;
    });
    
    // Main shadow for brand name
    filter += `,drawtext=text='${brandName}':fontcolor=black@0.7:fontsize=${fontSizeBrand}:` +
      `font='${overlayFontFamily}':x=${slideInX}+${shadowX}:y=${brandY}+${shadowY}:${brandAlpha},`;
    
    // Main text for brand name
    filter += `drawtext=text='${brandName}':fontcolor=${overlayTextColor}:fontsize=${fontSizeBrand}:` +
      `font='${overlayFontFamily}':x=${slideInX}:y=${brandY}:${brandAlpha}`;
    
    return filter;
  }

  // Helper function to build filter for each video based on text option
  function buildVideoFilter(videoIndex, showText) {
    const input = `[${videoIndex}:v]`;
    const output = `[v${videoIndex}]`;

    const baseFilter = `scale=1080:1920:force_original_aspect_ratio=decrease,` +
      `pad=1080:1920:(ow-iw)/2:(oh-ih)/2,setsar=1,fps=30`;

    let filter = input + baseFilter;

    // Add text filter only if showText is true
    if (showText) {
      const textFilter = buildTextFilter(showText);
      if (textFilter) {
        filter += `,${textFilter}`;
      }
    }

    return filter + output;
  }

  // Build filter array
  const filters = [];

  // Handle string values like 'true' and 'false'
  const showText1 = video1TextOption === undefined ? true :
    video1TextOption === true || video1TextOption === 'true';

  const showText2 = video2TextOption === undefined ? true :
    video2TextOption === true || video2TextOption === 'true';

  const showText3 = video3TextOption === undefined ? true :
    video3TextOption === true || video3TextOption === 'true';


  // console.log("Congrats Option:", congratsOption);
  
  // Video 1 - no animation
  filters.push(buildVideoFilter(0, showText1));
  
  // Video 2 (middle video) - apply GIF animation if available
  if (tempGifPath) {
    // First apply text to video2
    filters.push(buildVideoFilter(1, showText2));
    // Then overlay GIF animation on video2 (GIF is input index 3)
    filters.push(`[3:v]scale=1080:1920:flags=lanczos,format=rgba[gif_scaled]`);
    filters.push(`[v1][gif_scaled]overlay=0:0:shortest=1[v1]`);
  } else {
    filters.push(buildVideoFilter(1, showText2));
  }
  
  // Video 3 - no animation
  filters.push(buildVideoFilter(2, showText3));

  // Get video durations for fade calculation
  const getVideoDuration = (filePath) => {
    return new Promise((resolve, reject) => {
      ffmpeg.ffprobe(filePath, (err, metadata) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(metadata.format.duration);
      });
    });
  };

  try {
    // Get durations of each video
    const duration1 = await getVideoDuration(tempvideo1Path);
    const duration2 = await getVideoDuration(tempvideo2Path);
    const duration3 = await getVideoDuration(tempvideo3Path);

    let totalDuration = duration1 + duration2 + duration3;
    const congratsDuration = 4; // Fixed duration for congratulations screen

    // Only add congratulations if congratsOption is true
    if (congratsOption === true || congratsOption === 'true') {
      totalDuration += congratsDuration;
      const line1 = escapeFFmpegText("CONGRATULATIONS");
      const line2 = escapeFFmpegText(clientname);
      const congratsFontSize1 = 100;
      const congratsFontSize2 = 120;

      // Use simple color names that FFmpeg understands
      const congratsBgColor = "darkred";
      const congratsGoldColor = "yellow";
      const clientNameColor = "white";

      filters.push(
        // Create solid background for congratulations
        `color=c=${congratsBgColor}:s=1080x1920:d=${congratsDuration}[congratsbg]`,

        // Congratulations text - YELLOW/GOLD
        `[congratsbg]drawtext=text='${line1}':fontcolor=black:fontsize=${congratsFontSize1}:` +
        `x=(w-text_w)/2+3:y=h/2-180+3:enable='between(t,0,${congratsDuration})'[cg1shadow]`,

        `[cg1shadow]drawtext=text='${line1}':fontcolor=${congratsGoldColor}:fontsize=${congratsFontSize1}:` +
        `x=(w-text_w)/2:y=h/2-180:enable='between(t,0,${congratsDuration})'[cg1]`,

        // Client name - BIG and WHITE
        `[cg1]drawtext=text='${line2}':fontcolor=black:fontsize=${congratsFontSize2}:` +
        `x=(w-text_w)/2+4:y=h/2+4:enable='between(t,0,${congratsDuration})'[cg2shadow]`,

        `[cg2shadow]drawtext=text='${line2}':fontcolor=${clientNameColor}:fontsize=${congratsFontSize2}:` +
        `x=(w-text_w)/2:y=h/2:enable='between(t,0,${congratsDuration})'[v3]`
      );

      // Concatenate all 4 videos (3 original + 1 congratulations)
      filters.push(`[v0][v1][v2][v3]concat=n=4:v=1:a=0[vout]`);
    } else {
      // console.log("NOT adding congratulations video");
      // Only concatenate the 3 original videos
      filters.push(`[v0][v1][v2]concat=n=3:v=1:a=0[vout]`);
    }

    // console.log(`Video durations: ${duration1.toFixed(2)}s + ${duration2.toFixed(2)}s + ${duration3.toFixed(2)}s = ${totalDuration.toFixed(2)}s`);

    // Calculate fade start time (start fading 2 seconds before end)
    const fadeStart = Math.max(0, totalDuration - 2);
    // console.log(`Will apply audio fade-out starting at ${fadeStart.toFixed(2)}s`);

    // Now do the merge in a single pass with estimated fade timing
    await new Promise((resolve, reject) => {
      // console.log("Starting merge...");

      let cmd = ffmpeg()
        .input(tempvideo1Path)
        .input(tempvideo2Path)
        .input(tempvideo3Path);
      
      // Add GIF input if available (for middle video animation) - this will be input index 3
      if (tempGifPath) {
        cmd.input(tempGifPath).inputOptions(["-stream_loop", "-1"]);
      }
      
      // Add audio input if available - this will be input index 3 (if no GIF) or 4 (if GIF exists)
      if (tempAudioPath) {
        cmd.input(tempAudioPath).inputOptions(["-stream_loop", "-1"]);
      }
      
      cmd.complexFilter(filters)
        .outputOptions([
          "-map [vout]",
          ...(tempAudioPath ? [`-map ${tempGifPath ? '4' : '3'}:a`, "-c:a aac", "-b:a 128k"] : ["-an"]), // Add audio if available, otherwise no audio
          "-c:v libx264",
          "-preset fast",
          "-crf 24",
          "-pix_fmt yuv420p",
          "-movflags +faststart",
          "-shortest"
        ]);
      
      // Add audio fade filter only if audio is available
      if (tempAudioPath) {
        cmd.audioFilters(`afade=t=out:st=${fadeStart}:d=2`);
      }
      
      cmd.output(outputPath)
        .on("start", (commandLine) => {
          // console.log("FFmpeg command started");
        })
        .on("progress", (progress) => {
          if (progress.percent) {
            // console.log(`Processing: ${progress.percent.toFixed(2)}%`);
          }
        })
        .on("end", () => {
          // console.log("Merge completed successfully");
          resolve();
        })
        .on("error", (err, stdout, stderr) => {
          console.error("FFmpeg stderr:", stderr);
          const e = new Error("ffmpeg error: " + err.message);
          reject(e);
        })
        .run();
    });

  } catch (durationError) {
    console.warn("Could not get video durations, using fallback approach:", durationError.message);

    // Fallback approach without duration calculation
    let concatFilter;

    // Only add congratulations if congratsOption is true
    if (congratsOption === true || congratsOption === 'true') {
      // console.log("Adding congratulations video (fallback mode)");

      const congratsDuration = 4;
      const line1 = escapeFFmpegText("CONGRATULATIONS");
      const line2 = escapeFFmpegText(clientname);
      const congratsFontSize1 = 100;
      const congratsFontSize2 = 120;

      const congratsBgColor = "darkred";
      const congratsGoldColor = "yellow";
      const clientNameColor = "white";

      filters.push(
        `color=c=${congratsBgColor}:s=1080x1920:d=${congratsDuration}[congratsbg]`,
        `[congratsbg]drawtext=text='${line1}':fontcolor=black:fontsize=${congratsFontSize1}:` +
        `x=(w-text_w)/2+3:y=h/2-180+3:enable='between(t,0,${congratsDuration})'[cg1shadow]`,
        `[cg1shadow]drawtext=text='${line1}':fontcolor=${congratsGoldColor}:fontsize=${congratsFontSize1}:` +
        `x=(w-text_w)/2:y=h/2-180:enable='between(t,0,${congratsDuration})'[cg1]`,
        `[cg1]drawtext=text='${line2}':fontcolor=black:fontsize=${congratsFontSize2}:` +
        `x=(w-text_w)/2+4:y=h/2+4:enable='between(t,0,${congratsDuration})'[cg2shadow]`,
        `[cg2shadow]drawtext=text='${line2}':fontcolor=${clientNameColor}:fontsize=${congratsFontSize2}:` +
        `x=(w-text_w)/2:y=h/2:enable='between(t,0,${congratsDuration})'[v3]`
      );

      concatFilter = `[v0][v1][v2][v3]concat=n=4:v=1:a=0[vout]`;
    } else {
      // console.log("NOT adding congratulations video (fallback mode)");
      concatFilter = `[v0][v1][v2]concat=n=3:v=1:a=0[vout]`;
    }

    filters.push(concatFilter);

    // Fallback: Use simpler approach without fade timing
    await new Promise((resolve, reject) => {
      // console.log("Starting fallback merge (no audio fade-out)...");

      let cmd = ffmpeg()
        .input(tempvideo1Path)
        .input(tempvideo2Path)
        .input(tempvideo3Path);
      
      // Add GIF input if available (for middle video animation) - this will be input index 3
      if (tempGifPath) {
        cmd.input(tempGifPath).inputOptions(["-stream_loop", "-1"]);
      }
      
      // Add audio input if available - this will be input index 3 (if no GIF) or 4 (if GIF exists)
      if (tempAudioPath) {
        cmd.input(tempAudioPath).inputOptions(["-stream_loop", "-1"]);
      }
      
      cmd.complexFilter(filters)
        .outputOptions([
          "-map [vout]",
          ...(tempAudioPath ? [`-map ${tempGifPath ? '4' : '3'}:a`, "-c:a aac", "-b:a 128k"] : ["-an"]), // Add audio if available, otherwise no audio
          "-c:v libx264",
          "-preset fast",
          "-crf 24",
          "-pix_fmt yuv420p",
          "-movflags +faststart",
          "-shortest"
        ])
        .output(outputPath)
        .on("start", (commandLine) => {
          // console.log("FFmpeg command started");
        })
        .on("progress", (progress) => {
          if (progress.percent) {
            // console.log(`Processing: ${progress.percent.toFixed(2)}%`);
          }
        })
        .on("end", () => {
          // console.log("Merge completed successfully (no fade-out)");
          resolve();
        })
        .on("error", (err, stdout, stderr) => {
          console.error("FFmpeg stderr:", stderr);
          const e = new Error("ffmpeg error: " + err.message);
          reject(e);
        })
        .run();
    });
  }

  // console.log("Output path:", outputPath);

  const mergedBuffer = await fs.readFile(outputPath);
  const posterVideoId = await uploadToGridFS(
    `merged-${Date.now()}.mp4`,
    mergedBuffer,
    "video/mp4"
  );

  // Cleanup temp files
  try {
    await fs.unlink(tempvideo1Path);
    await fs.unlink(tempvideo2Path);
    await fs.unlink(tempvideo3Path);
    if (tempAudioPath) {
      await fs.unlink(tempAudioPath);
    }
    if (tempGifPath) {
      await fs.unlink(tempGifPath);
    }
    await fs.unlink(outputPath);
  } catch (cleanupErr) {
    console.warn("Failed to cleanup temp files:", cleanupErr);
  }

  return posterVideoId;
}

module.exports = {
  mergeTwoVideos,
  mergeThreeVideos,
};
