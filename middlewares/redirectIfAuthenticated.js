const jwt = require("jsonwebtoken");

const redirectIfAuthenticated = (req, res, next) => {
  const cookies =
    Object.keys(req.signedCookies).length > 0 ? req.signedCookies : null;
  if (cookies) {
    try {
      const token = cookies[process.env.COOKIE_NAME];
      if (token) {
        decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (decoded) {
          res.redirect("/inbox");
        }
      } else {
        next();
      }
    } catch (error) {
      next();
    }
  } else {
    next();
  }
};

module.exports = redirectIfAuthenticated;
