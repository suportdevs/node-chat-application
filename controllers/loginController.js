function getLogin(req, res, next) {
  res.render("index.ejs", {
    title: `Inbox - ${process.env.APP_NAME}`,
  });
}

module.exports = {
  getLogin,
};
