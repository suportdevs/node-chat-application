function getInbox(req, res, next) {
  try {
    res.render("inbox", { title: "Inbox - Chat Application" });
  } catch (error) {
    next(error);
  }
}

async function searchUsers(req, res, next) {
  try {
    const { user } = req.body;
    if (!user) throw createError("Please type anything.");
  } catch (error) {}
}

module.exports = { getInbox };
