const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: true,
    },
    rating: {
      type: Number,
      min: [1, "Minimum rating can be 1."],
      max: [5, "Maximum rating can be 5"],
      required: true,
    },
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: "Tour",
      required: [true, "A review must belong to a tour."],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: [true, "A review must have a user."],
    },
    createdAt: {
      type: Date,
      default: Date.now,
      select: false,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// reviewSchema.post(/^find/, function (doc, next) {
//   console.log(doc.constructor);
//   next();
// });

reviewSchema.pre(/^find/, function (next) {
  this.populate({
    path: "user",
    select: "name photo",
  });

  // }).populate({
  //   path: "tour",
  //   select: "name ",
  // });
  next();
});

const reviewModel = mongoose.model("Review", reviewSchema);

module.exports = reviewModel;
