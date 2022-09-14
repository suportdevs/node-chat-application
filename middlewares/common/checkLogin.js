// external imports
const jwt = require("jsonwebtoken");

const checkLogin = (req, res, next) => {
  let cookies =
    Object.keys(req.signedCookies).length > 0 ? req.signedCookies : null;
  if (cookies) {
    try {
      const token = cookies[process.env.COOKIE_NAME];
      const decoded = jwt.verify(token, process.env.COOKIE_SECRET);
      req.user = decoded;

      if (res.locals.html) {
        res.locas.loggedInUser = decoded;
      }
      next();
    } catch (err) {
      if (res.locals.html) {
        res.redirect("/");
      } else {
        res.status(500).send({
          errors: {
            common: {
              msg: "Authentication faild!",
            },
          },
        });
      }
    }
  } else {
    if (res.locals.html) {
      res.redirect("/");
    } else {
      res.status(500).send({
        errors: {
          common: {
            msg: "Authentication faild!",
          },
        },
      });
    }
  }
};

module.exports = {
  checkLogin,
};
