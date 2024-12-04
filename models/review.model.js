const mongoose = require("mongoose");

const Tour = require("./tour.model");

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

//two approaches to update the numRatings and avgRatings on tour

//approach 1 - directly manipulate the tour - better than aggregation in case of large collections
// reviewSchema.post("save", async function (doc, next) {
//   const tourId = doc.tour;
//   const tour = await Tour.findById(tourId);
//   const newAverage =
//     (tour.ratingsAverage * tour.ratingsQuantity + doc.rating) /
//     (tour.ratingsQuantity + 1);

//   tour.ratingsAverage = newAverage;
//   tour.ratingsQuantity += 1;
//   await tour.save();
// });

//approach 2 - make use of aggregation pipeline
reviewSchema.statics.calcAverageRating = async function (tourId) {
  const stats = await this.aggregate([
    {
      $match: {
        tour: tourId,
      },
    },
    {
      $group: {
        _id: "$tour",
        numRating: { $sum: 1 },
        avgRating: { $avg: "$rating" },
      },
    },
  ]);

  await Tour.findByIdAndUpdate(tourId, {
    ratingsAverage: stats[0].avgRating,
    ratingsQuantity: stats[0].numRating,
  });
};

reviewSchema.post("save", async function (doc, next) {
  await doc.constructor.calcAverageRating(doc.tour);
  next();
});

const reviewModel = mongoose.model("Review", reviewSchema);

module.exports = reviewModel;
