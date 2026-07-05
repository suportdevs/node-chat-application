const uploader = require("../utilies/multipleUploader");

function attachmentUpload(req, res, next) {
  const upload = uploader(
    "attachments",
    [
      "image/jpg",
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/gif",
      "video/mp4",
      "video/webm",
      "video/quicktime",
      "audio/mpeg",
      "audio/mp3",
      "audio/wav",
      "audio/webm",
      "audio/ogg",
      "audio/mp4",
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-powerpoint",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      "text/plain",
      "application/zip",
      "application/x-zip-compressed",
    ],
    25 * 1024 * 1024,
    8,
    "Only image, video, audio, PDF, Office, text, and zip files are allowed."
  );

  upload.any()(req, res, (err) => {
    if (err) {
      res.status(500).json({ errors: { common: { msg: err.message } } });
    } else {
      next();
    }
  });
}

module.exports = attachmentUpload;
