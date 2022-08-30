function getUser(req, res, next) {
  res.render("users.ejs", {
    title: `Users - ${process.env.APP_NAME}`,
  });
}

module.exports = {
  getUser,
};
