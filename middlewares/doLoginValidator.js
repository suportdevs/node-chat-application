const { check, validationResult } = require("express-validator");

const doLoginValidator = [
  check("email")
    .isLength({ min: 1 })
    .withMessage("Email or Mobile is required!"),
  check("password").isLength({ min: 1 }).withMessage("Password is required!"),
];

const doLoginValidationHandler = (req, res, next) => {
  const errors = validationResult(req);
  const mappedErrors = errors.mapped();
  if (Object.keys(mappedErrors).length === 0) {
    next();
  } else {
    res.locals.data.email = req.body.email;
    res.render("index", {
      errors: mappedErrors,
    });
  }
};

module.exports = { doLoginValidator, doLoginValidationHandler };
