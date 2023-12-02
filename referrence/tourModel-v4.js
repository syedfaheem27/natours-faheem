const mongoose = require('mongoose');
const slugify = require('slugify');

//Defining schema with schema options
const tourSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A Tour must have a name'],
      unique: true,
      trim: true,
    },
    slug: String,
    secretTour: {
      type: Boolean,
      default: false,
    },
    duration: {
      type: Number,
      required: [true, 'A Tour must have a duration'],
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A Tour must have a group size'],
    },
    difficulty: {
      type: String,
      required: [true, 'A Tour must have difficulty'],
    },

    ratingsAverage: {
      type: Number,
      default: 4.5,
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, 'A Tour must have a price'],
    },
    priceDiscount: Number,
    summary: {
      type: String,
      required: [true, 'A Tour must have a summary'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String,
      required: [true, 'A Tour must have a cover image'],
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false, //ensures that this field is never sent along
    },
    startDates: [Date],
  },

  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    id: false,
  },
);

tourSchema.virtual('durationWeeks').get(function () {
  if (!this.duration) return;

  return (this.duration / 7).toFixed(2) * 1;
});

//DOCUMENT MIDDLEWARE
tourSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

//QUERY MIDDLEWARE
tourSchema.pre(/^find/, function (next) {
  this.find({ secretTour: { $ne: true } });
  this.startTime = new Date();
  next();
});

tourSchema.post(/^find/, function (docs, next) {
  console.log(
    `The time it took to execute the query is ${
      Date.now() - this.startTime
    } milliseconds`,
  );
  next();
});

//AGGREGATION MIDDLEWARE
//our secret tour gets included in the aggregation pipeline
//Solution-1  Add a match field in each aggregation pipeline - repeated code
//and might forget to add a match field in some pipeline. Thus not efficient

//Solution-2  Add this match field in the aggregation middleware
tourSchema.pre('aggregate', function (next) {
  this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
  //- returns the pipeline array
  // console.log(this.pipeline());
  next();
});

//Creating a model for the defined schema
const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;

//In the next version, going to add built in and custom validators
