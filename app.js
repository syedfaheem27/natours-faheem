const express = require('express');
const morgan = require('morgan');
const { default: rateLimit } = require('express-rate-limit');
const { default: helmet } = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');

const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');

const app = express();

//GLOBAL MIDDLEWARES

//set security headers
app.use(helmet());

//set logging requests in development
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

const limiter = rateLimit({
  limit: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many api requests. Try again after one hour.',
});

//Body parser and setting the limit on the body size
app.use(express.json({ limit: '10kb' }));

//Data sanitization - Set Protection against noSQL Injection attacks
app.use(mongoSanitize());

//Data sanitization - Set Protection against cross site scripting attacks
app.use(xss());

//Preventing paramter pollution
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsQuantity',
      'ratingsAverage',
      'price',
      'difficulty',
      'maxGroupSize',
    ],
  }),
);

//limit requests from the same IP
app.use('/api', limiter);

//serving static files
app.use(express.static(`${__dirname}/public`));

//ROUTES
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);

//If a request reaches here, it means no route handler
//was able to catch it, so we can define our handler
//for all the unhandled routes

app.all('*', (req, res, next) => {
  const err = new AppError(`Can't find ${req.originalUrl} on this server`, 404);

  next(err);
});

app.use(globalErrorHandler);

module.exports = app;
