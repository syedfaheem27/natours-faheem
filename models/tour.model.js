const mongoose = require("mongoose");
const { default: slugify } = require("slugify");
// const User = require("./user.model");

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, " A tour must have a name"],
      trim: true,
      unique: true,
      minlength: [
        10,
        "A tour name must have a minimum length of 10 characters.",
      ],
      maxlength: [30, "A tour name must not be more than 30 characters long."],
      validate: {
        validator: function (val) {
          return /^[a-zA-Z\s]+$/.test(val);
        },
        message: "The tour name must have only alphabets.",
      },
    },
    slug: String,
    duration: {
      type: Number,
      required: [true, "A tour must have a duration"],
    },
    maxGroupSize: {
      type: Number,
      required: [true, "A tour must have a maximum group size"],
    },
    difficulty: {
      type: String,
      default: "easy",
      enum: {
        values: ["easy", "medium", "difficult"],
        message: "Difficulty must be one of easy, medium and hard.",
      },
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, "Minimum rating must be 1.0"],
      max: [5, "Maximum rating must be 5.0"],
      set: val => Math.round(val * 10) / 10,
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, "A tour must have a price"],
    },
    priceDiscount: {
      type: Number,
      default: 0,
      validate: {
        validator: function (val) {
          return this.price > val;
        },
        message: "The discount({VALUE}) should be less than the price.",
      },
    },
    summary: {
      type: String,
      trim: true,
      required: [true, "A tour must have a summary"],
    },
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String,
      required: [true, "A tour must have a cover image"],
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now,
      select: false,
    },
    startDates: [Date],
    secret: {
      type: Boolean,
      default: false,
      select: false,
    },
    startLocation: {
      type: {
        type: String,
        default: "Point",
        enum: ["Point"],
      },
      coordinates: [Number],
      description: String,
      address: String,
    },
    locations: [
      {
        type: {
          type: String,
          default: "Point",
          enum: ["Point"],
        },
        coordinates: [Number],
        description: String,
        day: Number,
      },
    ],
    guides: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "User",
      },
    ],
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// tourSchema.index({ price: 1 });
tourSchema.index({ price: 1, ratingsAverage: -1 });
tourSchema.index({ slug: 1 });
tourSchema.index({ startLocation: "2dsphere" });

tourSchema.virtual("durationWeeks").get(function () {
  return this.duration / 7;
});

tourSchema.virtual("reviews", {
  ref: "Review",
  foreignField: "tour",
  localField: "_id",
});

tourSchema.pre("save", function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

//One way of populating the guides fields in the Tours(Still using embedding concepts)

// tourSchema.pre("save", async function (next) {
//   const guidePromises = this.guides?.map(async id => await User.findById(id));
//   this.guides = await Promise.all(guidePromises);

//   next();
// });

tourSchema.pre(/^find/, function (next) {
  this.populate({
    path: "guides",
    select: "-__v -passwordChangedAt",
  });

  // this.explain();

  next();
});

tourSchema.pre(/^find/, function (next) {
  this.find({ secret: { $ne: true } });
  this.start = Date.now();
  next();
});

tourSchema.post(/^find/, function (_, next) {
  console.log(`The query took ${Date.now() - this.start} milliseconds`);

  next();
});

tourSchema.pre("aggregate", function (next) {
  // console.log();
  if (this.pipeline().find(stage => stage.$geoNear !== undefined))
    return next();

  this.pipeline().unshift({
    $match: { secret: { $ne: true } },
  });
  // console.log(this.pipeline());
  next();
});

const Tour = mongoose.model("Tour", tourSchema);
module.exports = Tour;
