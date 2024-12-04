const Review = require("../models/review.model");

const catchAsync = require("../utils/catchAsync");
const {
  deleteOne,
  updateOne,
  getAll,
  createOne,
} = require("./handler.factory");

//userId-jwt && params - tourId
exports.addReview = createOne(Review, ["review", "rating", "tour", "user"]);

exports.getReview = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const review = await Review.findById(id);

  res.status(200).json({
    status: "success",
    data: {
      review,
    },
  });
});

exports.getAllReviews = (req, res, next) => {
  getAll(Review, req.reviewFilter)(req, res, next);
};

//For admin - only supply a reviewId as a param
exports.deleteReview = deleteOne(Review);

exports.updateReview = updateOne(Review, ["review", "rating"]);
