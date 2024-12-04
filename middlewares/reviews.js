const catchAsync = require("../utils/catchAsync");
const Review = require("../models/review.model");
const AppError = require("../utils/appError");

exports.addTourUserIds = (req, res, next) => {
  const filter = {};

  //admin trying to get all possible reviews
  if (Object.keys(req.body).length === 0 && !req.params.tourId) {
    req.reviewFilter = {};
  } else {
    if (!req.params.tourId) filter.tour = req.body.tour;
    else filter.tour = req.params.tourId;

    if (!req.body.user) filter.user = req.user._id;
    else filter.user = req.body.user;

    req.reviewFilter = filter;
  }

  next();
};

exports.addTourUserBody = (req, res, next) => {
  if (!req.body.tour) req.body.tour = req.params.tourId;
  if (!req.body.user) req.body.user = req.user._id;

  next();
};

exports.preventDuplicateReviews = catchAsync(async (req, res, next) => {
  const review = await Review.findOne({
    tour: req.body.tour,
    user: req.body.user,
  });

  if (!review) return next();

  next(
    new AppError(
      "There is a review already for this tour from the same user. Try updating the review.",
      400,
    ),
  );
});
