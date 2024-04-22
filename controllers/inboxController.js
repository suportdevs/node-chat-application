function getInbox(req, res, next) {
  try {
    res.render("inbox", { title: "Inbox - Chat Application" });
  } catch (error) {
    next(error);
  }
}

module.exports = { getInbox };
