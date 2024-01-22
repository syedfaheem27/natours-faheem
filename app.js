const path = require('path');
const express = require('express');
const morgan = require('morgan');
const { default: rateLimit } = require('express-rate-limit');
const { default: helmet } = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');
const compression = require('compression');
const cors = require('cors');

const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const viewsRouter = require('./routes/viewsRoutes');
const bookingRouter = require('./routes/bookingRoutes');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');

const app = express();

//Setting up pug and the views folder
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

//GLOBAL MIDDLEWARES

//Adding CORS
//Not sufficient for non simple requests like PUT,PATCH,DELETE
app.use(cors());

//For non simple requests, you need to configure a preflight request
app.options('*', cors());

//serving static files
app.use(express.static(path.join(__dirname, 'public')));

//set security headers

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'", 'data:', 'blob:', 'https:', 'ws:'],
        baseUri: ["'self'"],
        fontSrc: ["'self'", 'https:', 'data:'],
        scriptSrc: [
          "'self'",
          'https:',
          'http:',
          'blob:',
          'https://*.mapbox.com',
          'https://js.stripe.com',
          'https://*.cloudflare.com',
        ],
        frameSrc: ["'self'", 'https://js.stripe.com'],
        objectSrc: ['none'],
        styleSrc: ["'self'", 'https:', "'unsafe-inline'"],
        workerSrc: ["'self'", 'data:', 'blob:'],
        childSrc: ["'self'", 'blob:'],
        imgSrc: ["'self'", 'data:', 'blob:'],
        connectSrc: [
          "'self'",
          'blob:',
          'wss:',
          'https://*.tiles.mapbox.com',
          'https://api.mapbox.com',
          'https://events.mapbox.com',
        ],
        upgradeInsecureRequests: [],
      },
    },
  }),
);

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

//Cookie parser
app.use(cookieParser());

//parsing data submitted directly via an HTML form
// app.use(express.urlencoded({ extended: true, limit: '10kb' }));

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

//Compresses the response texts
app.use(compression());

//ROUTES
app.use('/', viewsRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/bookings', bookingRouter);

//If a request reaches here, it means no route handler
//was able to catch it, so we can define our handler
//for all the unhandled routes

app.all('*', (req, res, next) => {
  const err = new AppError(`Can't find ${req.originalUrl} on this server`, 404);

  next(err);
});

app.use(globalErrorHandler);

module.exports = app;
