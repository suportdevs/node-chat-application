function getInbox(req, res, next) {
  res.render("inbox.ejs", {
    title: `Inbox - ${process.env.APP_NAME}`,
  });
}

module.exports = {
  getInbox,
};
