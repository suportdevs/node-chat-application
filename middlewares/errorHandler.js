const createHttpError = require("http-errors");

function notFoundHandler(req, res, next) {
  next(createHttpError(404, "Your request content are not found."));
}

function errorHandler(err, req, res, next) {
  res.locals.error =
    process.env.NODE_ENV === "production" ? err : { message: err.message };
  res.status(err.status || 500);

  if (!res.locals.html) {
    res.render("errors/error", {
      title: "Error Page",
    });
  } else {
    res.json(res.locals.error);
  }
}

module.exports = {
  notFoundHandler,
  errorHandler,
};
