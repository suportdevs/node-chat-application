// external imports
const { check, validationResult } = require("express-validator");
const { unlink } = require("fs");

// internal imports
const User = require("../../models/People");

const addValidators = [
  check("name")
    .isLength({ min: 1 })
    .withMessage("Name is required!")
    .isAlpha("en-us", { ignore: " -" })
    .withMessage("Name must not contain anything other then alphabet")
    .trim(),
  check("email")
    .isEmail()
    .withMessage("Invaild email address!")
    .trim()
    .custom(async (value) => {
      try {
        const user = await User.findOne({ email: value });
        if (user) {
          throw CreateError("Email is already use!");
        }
      } catch (err) {
        throw CreateError(err.message);
      }
    }),
  check("mobile")
    .isMobilePhone("bn-BD", { strictMode: true })
    .withMessage("Mobile number is must be a valid Bangladeshi number.")
    .trim()
    .custom(async (value) => {
      try {
        const user = await User.findOne({ mobile: value });
        if (user) {
          throw CreateError("Mobile is already use!");
        }
      } catch (err) {
        throw CreateError(err.message);
      }
    }),
  check("password")
    .isStrongPassword()
    .withMessage(
      "Password must at least 8 charactors long and should at least 1 lowarcase, 1 upporcase, 1 number, 1 symbol!"
    ),
];

const addUserValidationHandler = (req, res, next) => {
  const errors = validationResult(req);
  const mappedErrors = errors.mapped();
  if (Object.keys(mappedErrors).length === 0) {
    next();
  } else {
    if (req.files.length > 0) {
      const filename = req.files[0];
      unlink(
        path.join(__dirname, "/../public/uploads/avatars/" + filename),
        (err) => {
          if (err) {
            console.log(err);
          }
        }
      );
    }
    res.status(500).json({
      errors: mappedErrors,
    });
  }
};

module.exports = {
  addValidators,
  addUserValidationHandler,
};
