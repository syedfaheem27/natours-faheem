const mongoose = require('mongoose');

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

//populating the user and tour fields in the review document
// reviewSchema.pre(/^find/, function (next) {
//   this.populate({
//     path: 'user',
//     select: 'name photo',
//   }).populate({
//     path: 'tour',
//     select: 'name',
//   });

//   next();
// });

//While virtually populating reviews, the tour will again get populated by the reviews field
//which is unnecessary
reviewSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'user',
    select: 'name photo',
  });

  next();
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
