const path = require("path");

const express = require("express");

const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const hpp = require("hpp");
const cookieParser = require("cookie-parser");
const compression = require("compression");
const cors = require("cors");

const tourRouter = require("./router/tour.router");
const userRouter = require("./router/user.router");
const reviewRouter = require("./router/review.router");
const viewRouter = require("./router/view.router");
const bookingRouter = require("./router/booking.router");

const errorHandler = require("./controllers/error.controller");
const AppError = require("./utils/appError");

const app = express();

app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));

app.use(express.static(path.join(__dirname, "public")));

//Not sufficient for non simple requests like PUT,PATCH,DELETE
app.use(cors());

//For non simple requests, you need to configure a preflight request
app.options("*", cors());

const limiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 15 minutes
  limit: 100,
});

// Apply the rate limiting middleware to all requests.
app.use(limiter);

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'", "data:", "blob:", "https:", "ws:"],
        baseUri: ["'self'"],
        fontSrc: ["'self'", "https:", "data:"],
        scriptSrc: [
          "'self'",
          "https:",
          "http:",
          "blob:",
          "https://*.mapbox.com",
          "https://*.cloudflare.com",
          "https://checkout.stripe.com",
          "https://js.stripe.com/",
        ],
        frameSrc: [
          "'self'",
          "https://checkout.stripe.com",
          "https://js.stripe.com/",
        ],
        styleSrc: ["'self'", "https:", "'unsafe-inline'"],
        workerSrc: ["'self'", "data:", "blob:"],
        childSrc: ["'self'", "blob:"],
        imgSrc: ["'self'", "data:", "blob:"],
        connectSrc: [
          "'self'",
          "blob:",
          "wss:",
          "https://*.tiles.mapbox.com",
          "https://api.mapbox.com",
          "https://events.mapbox.com",
          "https://checkout.stripe.com", // Add Stripe Checkout here,
          "https://js.stripe.com/",
        ],
        upgradeInsecureRequests: [],
      },
    },
  }),
);

//parsing request body
app.use(express.json({ limit: "10kb" }));
app.use(cookieParser());
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

app.use(compression());

app.use(mongoSanitize());

app.use(
  hpp({
    whitelist: [
      "duration",
      "ratingsQuantity",
      "ratingsAverage",
      "maxGroupSize",
      "difficulty",
      "price",
    ],
  }),
);

//Adding request time to the request
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString;
  next();
});

if (process.env.NODE_ENV === "development") app.use(morgan("dev"));

//API Routes
app.use("/api/v1/tours", tourRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/reviews", reviewRouter);
app.use("/api/v1/bookings", bookingRouter);

//View Routes
app.use("/", viewRouter);

app.all("*", (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl}`));
});

app.use(errorHandler);

module.exports = app;
