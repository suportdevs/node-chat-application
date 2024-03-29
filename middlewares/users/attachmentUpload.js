const uploader = require("../../utilities/multipleUploader");

function attachmentUpload(req, res, next) {
  const upload = uploader(
    "attachments",
    ["images/jpg", "images/jpeg", "images/png"],
    1000000,
    5,
    "Only .jpg .jpeg .png files allowed."
  );
  // call then middleware function
  upload.any()(req, res, (err) => {
    if (err) {
      res.status(500).json({ errors: { avatar: { msg: err.message } } });
    } else {
      next();
    }
  });
}

module.exports = attachmentUpload;
