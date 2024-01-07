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

/*
can't use await this.clone();
In that case a clone of the original query is created and the query is executed which comes
from query.findByIdAndUpdate() and due to which the pre /^findAnd/ hook will be executed 
which will start an infinite loop.
*/

/*
this.clone().findOne() vs this.findOne().clone() - In the former case, you're cloning the query and 
using the findOne() which returns a query which is awaited to give u the results

In the latter case, your create a query first by doing this.findOne() and then clone this query 
and await it to get the stats which in this case is doing the same thing.
*/

reviewSchema.pre(/^findOneAnd/, async function (next) {
  this.rev = await this.clone().findOne();
  next();
});

reviewSchema.post(/^findOneAnd/, function () {
  tourUpdateReview(this.rev.constructor, this.rev.tour);
  delete this.rev;
});
reviewSchema.post('save', async function () {
  tourUpdateReview(this.constructor, this.tour);
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
