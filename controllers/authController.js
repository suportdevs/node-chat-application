async function getLogin(req, res, next) {
  try {
    res.render("index");
  } catch (error) {
    next(error);
  }
}

async function getRegister(req, res, next) {
  try {
    res.render("register");
  } catch (error) {
    next(error);
  }
}

async function doRegister(req, res, next) {
  try {
  } catch (error) {}
}

module.exports = {
  getLogin,
  getRegister,
  doRegister,
};
