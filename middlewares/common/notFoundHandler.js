//external imports
const createError = require("http-errors");

// not found eroors handler
function notFoundHandler(req, res, next) {
  next(createError(404, "Your request content was not found!"));
}


// default errors handler
function defaultErrorHandler(err, req, res, next) {
  res.locals.error =
    process.env.NODE_ENV === "development" ? err : { message: err.message };

  res.status(err.status || 500);

  if (res.locals.html) {
    res.locals.title = "Error Page";
    res.render("errors/errors.ejs");
  } else {
    res.json(res.locals.error);
  }
}

module.exports = {
  notFoundHandler,
  defaultErrorHandler,
};
