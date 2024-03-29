const mongoose = require('mongoose');
const slugify = require('slugify');
const validator = require('validator');

//Defining schema with schema options
const tourSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A Tour must have a name'],
      unique: true,
      trim: true,
      maxlength: [
        30,
        'A Tour name must be below or equal than 30 characters long',
      ],
      minlength: [
        10,
        'A Tour name must be above or equal than 10 characters long',
      ],
      validate: {
        validator: function (name) {
          return validator.isAlpha(name.replace(/\s/g, ''));
        },
        message: 'The name must only contain alphabets',
      },
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
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'Difficulty can either be easy, medium or difficult',
      },
    },

    ratingsAverage: {
      type: Number,
      default: 4.5,
      max: [5, 'Rating must be below or equal than 5'],
      min: [1, 'Rating must be above or equal than 1'],
      set: val => Math.round(val * 10) / 10,
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, 'A Tour must have a price'],
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function (val) {
          return val < this.price;
        },
        message: 'The discount should be less than the actual price',
      },
    },
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
    startLocation: {
      //GeoJSON
      type: {
        type: String,
        default: 'Point',
        enum: ['Point'],
      },
      coordinates: [Number],
      address: String,
      description: String,
    },
    locations: [
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point'],
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number,
      },
    ],
    guides: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
  },

  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    id: false,
  },
);

//simple index
// tourSchema.index({ price: 1 });

//compound index
tourSchema.index({ price: 1, ratingsAverage: -1 });

tourSchema.index({ slug: 1 });

tourSchema.index({ startLocation: '2dsphere' });

tourSchema.virtual('durationWeeks').get(function () {
  if (!this.duration) return;

  return (this.duration / 7).toFixed(2) * 1;
});

//virtual populate - populating reviews while getting tours
//without the tours knowing anything about them
//We will implement it in only in the getTour controller
//as for all the tours it will bloat the response
tourSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'tour',
  localField: '_id',
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

tourSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'guides',
    select: '-__v -passwordChangedAt',
  });

  next();
});

// tourSchema.post(/^find/, function (docs, next) {
//   console.log(
//     `The time it took to execute the query is ${
//       Date.now() - this.startTime
//     } milliseconds`,
//   );
//   next();
// });

//Disabling this pre aggregate hook so that
//$geoNear(aggregate) works as it needs to be the first one
//in the aggregation pipeline

//AGGREGATION MIDDLEWARE
// tourSchema.pre('aggregate', function (next) {
//   this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
//   //- returns the pipeline array
//   // console.log(this.pipeline());
//   next();
// });

//Creating a model for the defined schema
const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
