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
//this- refers to the query object
//this pre-find hook is called just before the
//query is executed

//Assume there's a secret tour meant for vips
//which we don't want to show the users queries
//the database for tours. We can make use of the
//query middleware to do so

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
  // console.log(docs); - queried docs
  next();
});

//Creating a model for the defined schema
const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;

//In the next version, we are going to address aggregation middleware
