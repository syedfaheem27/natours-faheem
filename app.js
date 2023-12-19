const express = require('express');

const morgan = require('morgan');

const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');

const app = express();

//MIDDLEWARE

app.use(express.json());

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

//serving static files
app.use(express.static(`${__dirname}/public`));

//ROUTES
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

//If a request reaches here, it means no route handler
//was able to catch it, so we can define our handler
//for all the unhandled routes

app.all('*', (req, res, next) => {
  const err = new AppError(`Can't find ${req.originalUrl} on this server`, 404);

  next(err);
});

app.use(globalErrorHandler);

module.exports = app;
