const uploader = require("../utilies/singleUploader");

function avatarUpload(req, res, next) {
  const upload = uploader(
    "avatars",
    ["image/jpg", "image/jpeg", "image/png"],
    1000000,
    "Only .jpg, .jpeg, .png file allowed."
  );

  upload.single("avatar")(req, res, (err) => {
    if (err) {
      res.status(500).json({ errors: { common: { msg: err.message } } });
    } else {
      next();
    }
  });
}

module.exports = avatarUpload;
