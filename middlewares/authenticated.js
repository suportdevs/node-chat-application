// internal imports
const jwt = require("jsonwebtoken");

const authenticated = (req, res, next) => {
  let cookies =
    Object.keys(req.signedCookies).length > 0 ? req.signedCookies : null;

  if (cookies) {
    try {
      const token = cookies[process.env.COOKIE_NAME];
      if (token) {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        req.user = decoded;
        if (res.locals.html) {
          res.locals.loggedInUser = decoded;
        }
        next();
      } else {
        if (res.locals.html) {
          res.redirect("/");
        } else {
          res.status(500).json({
            errors: { common: { msg: "Token is not valid!" } },
          });
        }
      }
    } catch (err) {
      if (res.locals.html) {
        res.redirect("/");
      } else {
        res.status(500).json({
          errors: { common: { msg: "Authentication failed!" } },
        });
      }
    }
  } else {
    if (res.locals.html) {
      res.redirect("/");
    } else {
      res.status(500).json({
        errors: { common: { msg: "Authentication failed!" } },
      });
    }
  }
};

module.exports = authenticated;
