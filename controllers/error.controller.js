const AppError = require("../utils/appError");

const handleCastErrorDB = err => {
  const errMsg = `Invalid ${err.path} : ${err.value}`;
  return new AppError(errMsg, 400);
};

const handleDuplicateErrorDB = err => {
  const errMsg = `An entry with the same value found : ${err.errorResponse.keyValue.name}`;
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

const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

const sendErrorProd = (err, res) => {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    res.status(500).json({
      status: "error",
      message: "Something went very wrong!",
    });
  }
};

module.exports = (err, req, res, next) => {
  err.stathandleCastErrorsDBus = err.status || "fail";
  err.statusCode = err.statusCode || 500;

  if (process.env.NODE_ENV === "development") sendErrorDev(err, res);
  else if (process.env.NODE_ENV === "production") {
    let error = { ...err };
    if (err.name === "CastError") error = handleCastErrorDB(error);
    if (err?.errorResponse?.errmsg?.includes("duplicate key"))
      error = handleDuplicateErrorDB(error);
    if (err.name === "ValidationError") error = handleValidationErrorsDB(error);
    if (err.name === "JsonWebTokenError") error = handleInvalidJWTError();
    if (err.name === "TokenExpiredError") error = handleExpiredJWTError();

    sendErrorProd(error, res);
  }
};
