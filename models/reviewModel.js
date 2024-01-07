const mongoose = require('mongoose');
const tourUpdateReview = require('../utils/tourReviewUpdate');

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, "A review can't be empty!"],
    },
    rating: {
      type: Number,
      min: [1, "A review can't be less than 1"],
      max: [5, "A review can't be greater than 5"],
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    tour: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tour',
      required: [true, 'Review must belong to a tour'],
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Review must belong to a user'],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

//preventing review duplication - a single user can create only one review
//for the same tour

reviewSchema.index({ tour: 1, user: 1 }, { unique: true });

reviewSchema.statics.calcAverageRatings = async function (tourId) {
  const stats = await this.aggregate([
    {
      $match: { tour: tourId },
    },
    {
      $group: {
        _id: null,
        nRatings: { $sum: 1 },
        avgRating: { $avg: '$rating' },
      },
    },
  ]);

  return stats;
};

reviewSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'user',
    select: 'name photo',
  });

  next();
});

reviewSchema.post(/^findOneAnd/, async function (doc) {
  tourUpdateReview(doc.constructor, doc.tour);
});

reviewSchema.post('save', async function () {
  tourUpdateReview(this.constructor, this.tour);
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
