class AppError extends Error {
  constructor(message, statusCode) {
    super(message);

    this.statusCode = statusCode;
    this.status = `${this.statusCode}`.startsWith('4') ? 'fail' : 'error';

    //would be useful while sending errors to the client
    //non-operational errors won't be sent to client
    this.isOperational = true;

    //Ensures that whatever error originates in this class won't occur in the stack trace
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
