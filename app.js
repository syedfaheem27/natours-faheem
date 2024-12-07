const path = require("path");

const express = require("express");

const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const hpp = require("hpp");

const tourRouter = require("./router/tour.router");
const userRouter = require("./router/user.router");
const reviewRouter = require("./router/review.router");

const errorHandler = require("./controllers/error.controller");
const AppError = require("./utils/appError");

const app = express();

app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));

app.use(express.static(path.join(__dirname, "public")));

const limiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 15 minutes
  limit: 100,
});

// Apply the rate limiting middleware to all requests.
app.use(limiter);

app.use(helmet());

//parsing request body
app.use(express.json({ limit: "10kb" }));

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

//View Routes
app.get("/", (req, res) => {
  res.status(200).render("base", {
    tour: "The Dummy Tour",
  });
});

app.get("/overview", (req, res) => {
  res.status(200).render("overview", {
    title: "All Tours",
  });
});

app.get("/tour", (req, res) => {
  res.status(200).render("tour", {
    title: "The Forest Hiker",
  });
});

//API Routes
app.use("/api/v1/tours", tourRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/reviews", reviewRouter);

app.all("*", (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl}`));
});

app.use(errorHandler);

module.exports = app;
