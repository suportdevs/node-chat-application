// internal imports
const { check, validationResult } = require("express-validator");
const createError = require("http-errors");
const path = require("path");
const { unlink } = require("fs");

// external imports
const User = require("../models/People");

const registerValidators = [
  check("name")
    .isLength({ min: 3 })
    .withMessage("Name is required!")
    .isAlpha("en-US", { ignore: " -" })
    .withMessage("Name must not contain anything other then Alphabet.")
    .trim(),
  check("email")
    .isEmail()
    .withMessage("Invalid email address")
    .trim()
    .custom(async (value) => {
      try {
        const user = await User.findOne({ email: value });
        if (user) {
          throw createError("Email already is ues!");
        }
      } catch (error) {
        throw createError(error.message);
      }
    }),
  check("mobile")
    .isMobilePhone("bn-BD")
    .withMessage("Mobile must be a valid Bangladeshi mobile number"),
  check("password")
    .isStrongPassword()
    .withMessage(
      "Password must be at least 8 charactors long & should contain at least 1 lowercase, 1 uppercase, 1 number & 1 symbol."
    ),
];

function registerValidationHandler(req, res, next) {
  const errors = validationResult(req);
  console.log(errors);
  const mappedErrors = errors.mapped();
  if (Object.keys(mappedErrors).length === 0) {
    next();
  } else {
    // Check if req.files is defined and has a length greater than 0
    if (req.files && req.files.length > 0) {
      const { filename } = req.files[0];
      unlink(
        path.join(__dirname, `../public/uploads/avatars/${filename}`),
        (err) => {
          if (err) {
            throw createError(err.message); // Throw an error if unlink fails
          }
        }
      );
    }
    res.render("register", { errors: mappedErrors });
  }
}

module.exports = { registerValidators, registerValidationHandler };
