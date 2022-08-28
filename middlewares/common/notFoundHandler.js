const createError = require("http-errors");

// not found eroors handler
function notFoundHandler(req, res, next) {
  next(createError(404, "Your request content was not found!"));
}

// default errors handler
function defaultErrorHandler(err, req, res, next) {
  res.locals.title = "Error Page";
  res.render("errors/errors.ejs");
}

module.exports = {
  notFoundHandler,
  defaultErrorHandler,
};
