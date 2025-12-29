const { execFile } = require("child_process");

function getVideoDuration(videoPath) {
  return new Promise((resolve, reject) => {
    execFile(
      "ffprobe",
      [
        "-v",
        "error",
        "-show_entries",
        "format=duration",
        "-of",
        "default=noprint_wrappers=1:nokey=1",
        videoPath,
      ],
      (err, stdout) => {
        if (err) return reject(err);

        const duration = parseFloat(stdout);
        if (isNaN(duration)) {
          return reject(new Error("Could not read video duration"));
        }

        resolve(duration);
      }
    );
  });
}

module.exports = { getVideoDuration };
