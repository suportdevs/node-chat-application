// external imports
const createError = require("http-errors");
const multer = require("multer");
const path = require("path");

function uploader(
  subfolder_path,
  allowed_file_format,
  max_file_size,
  error_message
) {
  // define upload foler
  const UPLOAD_FOLDER = `${__dirname}/../public/uploads/${subfolder_path}/`;

  // define the storage
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, UPLOAD_FOLDER);
    },
    filename: (req, file, cb) => {
      const fileExt = path.extname(file.originalname);
      const filename =
        file.originalname.replace(fileExt).split(" ").join("-") +
        "-" +
        Date.now();
      cb(null, filename + fileExt);
    },
  });

  const upload = multer({
    storage: storage,
    limits: {
      fileSize: max_file_size,
    },
    fileFilter: (req, file, cb) => {
      if (allowed_file_format.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(createError(error_message));
      }
    },
  });

  return upload;
}

module.exports = uploader;
