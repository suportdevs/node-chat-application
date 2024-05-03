const multer = require("multer");
const path = require("path");

function uploader(
  subfolder_path,
  allowed_file_types,
  file_size,
  allowed_max_files,
  error_msg
) {
  const UPLOADS_FOLDER = `${__dirname}/../public/uploads/${subfolder_path}`;

  // define the multer storage
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, UPLOADS_FOLDER);
    },
    filename: (req, file, cb) => {
      const fileExt = path.extname(file.originalname);
      const fileName =
        file.originalname
          .replace(fileExt, "")
          .toLowerCase()
          .split(" ")
          .join("-") +
        "-" +
        Date.now();
      cb(null, fileName + fileExt);
    },
  });

  // prepared the file multer upload object
  const upload = multer({
    storage: storage,
    limits: { fileSize: file_size },
    fileFilter: (req, file, cb) => {
      if (req.files.length > allowed_max_files) {
        cb(
          createError(
            `Maxium ${allowed_max_files} files are allowed to upload.`
          )
        );
      } else {
        if (allowed_file_types.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(error_msg);
        }
      }
    },
  });
  return upload;
}

module.exports = uploader;
