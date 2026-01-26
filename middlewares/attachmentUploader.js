const uploader = require("../utilies/multipleUploader");

function attachmentUpload(req, res, next) {
  const upload = uploader(
    "attachments",
    ["image/jpg", "image/jpeg", "image/png", "image/webp"],
    5 * 1024 * 1024,
    4,
    "Only .jpg, .jpeg, .png, .webp file allowed."
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
