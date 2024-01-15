const AppError = require('../utils/appError');

function handleCastErrorDB(err) {
  const message = `Invalid ${err.path.replace('_', '')}: ${err.value} `;
  return new AppError(message, 400);
}

function handleDuplicateFieldsDB(err) {
  const message = `Duplicate Field value: ${err.keyValue.name}. Please use another value`;
  return new AppError(message, 400);
}

function handleValidationDB(err) {
  const message = err.message.replace(
    'Tour validation failed:',
    'Invalid input data.',
  );
  return new AppError(message, 400);
}

function handleJwtError() {
  return new AppError('Invalid Token. Please login again.', 401);
}

function handleJwtExpiryError() {
  return new AppError('Your token has expired!. Please login again.', 401);
}

function sendErrorDev(err, req, res) {
  //A) API related errors
  if (req.originalUrl.startsWith('/api'))
    return res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack,
    });

  //B) Rendered Website related errors
  //Ok to leak error messages in development
  return res.status(err.statusCode).render('error', {
    title: 'Something went wrong',
    msg: err.message,
  });
}

function sendErrorProd(err, req, res) {
  //A) API related errors
  if (req.originalUrl.startsWith('/api') && err.isOperational) {
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  }

  if (req.originalUrl.startsWith('/api') && !err.isOperational) {
    console.log('ERROR 🔥', err);

    return res.status(500).json({
      status: 'error',
      message: 'Something went very wrong!',
    });
  }

  // Rendered Website related errors

  if (err.isOperational) {
    return res.status(err.statusCode).render('error', {
      status: err.status,
      msg: err.message,
    });
  }

  if (!err.isOperational) {
    console.log('ERROR 🔥', err);

    return res.status(500).render('error', {
      status: 'error',
      msg: 'Something went very wrong!',
    });
  }
}

module.exports = (err, req, res, next) => {
  let error = Object.create(
    Object.getPrototypeOf(err),
    Object.getOwnPropertyDescriptors(err),
  );

  error.statusCode = error.statusCode || 500;
  error.status = error.status || 'error';

  if (process.env.NODE_ENV === 'development') sendErrorDev(error, req, res);

  if (error.name === 'CastError') error = handleCastErrorDB(error);

  if (error.codeName === 'DuplicateKey') error = handleDuplicateFieldsDB(error);

  if (error.name === 'ValidationError') error = handleValidationDB(error);

  if (error.name === 'JsonWebTokenError') error = handleJwtError(error);

  if (error.name === 'TokenExpiredError') error = handleJwtExpiryError(error);

  if (process.env.NODE_ENV === 'production') sendErrorProd(error, req, res);
};
