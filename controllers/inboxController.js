function getInbox(req, res, next) {
  res.render("inbox.ejs");
}

async function sarchUsers(req, res, next) {
  const user = req.body.user;
  const searchquery = user.replace("+88", "");

  const name_search_regex = new RegExp();
}

module.exports = {
  getInbox,
};
