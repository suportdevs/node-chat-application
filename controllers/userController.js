function getUser(req, res, next) {
  res.render("users.ejs");
}

module.exports = {
  getUser,
};
