function getInbox(req, res, next) {
  res.render("inbox.ejs");
}

module.exports = {
  getInbox,
};
