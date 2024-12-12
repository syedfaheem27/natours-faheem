const AppError = require("../utils/appError");

const handleCastErrorDB = err => {
  const errMsg = `Invalid ${err.path} : ${err.value}`;
  return new AppError(errMsg, 400);
};

const handleDuplicateErrorDB = err => {
  const errObj = err.errorResponse.keyValue;
  let key = Object.keys(errObj)[0];

  const errMsg = `An entry with the same value found : ${key}`;
  return new AppError(errMsg, 400);
};

const handleValidationErrorsDB = err => {
  const errValues = Object.values(err.errors).map(e => e.message);
  const errMsg = `Validation Errors: ${errValues.join(" ")}`;
  return new AppError(errMsg, 400);
};

const handleInvalidJWTError = () =>
  new AppError("Invalid JWT token. Please log in again.", 401);

const handleExpiredJWTError = () =>
  new AppError("The JWT token is expired. Please log in again.", 401);

const sendErrorDev = (err, req, res) => {
  if (req.originalUrl.startsWith("/api")) {
    return res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack,
    });
  }
  res.status(err.statusCode).render("error", {
    title: "Something went wrong",
    msg: err.message,
  });
};

const sendErrorProd = (err, req, res) => {
  if (err.isOperational) {
    //API
    if (req.originalUrl.startsWith("/api")) {
      return res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
      });
    }
    //Website errors
    return res.status(err.statusCode).render("error", {
      title: "Something went wrong",
      msg: err.message,
    });
  }

  //non-operational errors

  //API
  if (req.originalUrl.startsWith("/api"))
    return res.status(500).json({
      status: "error",
      message: "Something went very wrong!",
    });

  //Website errors
  res.status(err.statusCode).render("error", {
    title: "Something went wrong",
    msg: "Something bad happened. Please try again later.",
  });
};

module.exports = (err, req, res, next) => {
  // err.stathandleCastErrorsDBus = err.status || "fail";
  err.statusCode = err.statusCode || 500;

  if (process.env.NODE_ENV === "development") sendErrorDev(err, req, res);
  else if (process.env.NODE_ENV === "production") {
    let error = { ...err };
    error.message = err.message;

    if (err.name === "CastError") error = handleCastErrorDB(error);
    if (err?.errorResponse?.errmsg?.includes("duplicate key"))
      error = handleDuplicateErrorDB(error);
    if (err.name === "ValidationError") error = handleValidationErrorsDB(error);
    if (err.name === "JsonWebTokenError") error = handleInvalidJWTError();
    if (err.name === "TokenExpiredError") error = handleExpiredJWTError();

    sendErrorProd(error, req, res);
  }
};
