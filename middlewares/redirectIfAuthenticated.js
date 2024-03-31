const redirectIfAuthenticated = (req, res, next) => {
  let cookies =
    Object.keys(req.signedCookies).length > 0 ? req.signedCookies : null;

  if (cookies) {
    const token = cookies[process.env.COOKIE_NAME];
    if (token) {
      res.redirect("/inbox");
    } else {
      next();
    }
  } else {
    next();
  }
};

module.exports = redirectIfAuthenticated;
