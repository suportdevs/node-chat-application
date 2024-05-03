const uploader = require("../utilies/multipleUploader");

function attachmentUpload(req, res, next) {
  const upload = uploader(
    "attachments",
    ["image/jpg", "image/jpeg", "image/png"],
    1000000,
    4,
    "Only .jpg, .jpeg, .png file allowed."
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
