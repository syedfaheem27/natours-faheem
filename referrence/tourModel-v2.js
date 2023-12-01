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

//Document middleware - need to define it before the tour model is compiled
//the pre save hook can be used before .save() and .create() - not for insertMany()

tourSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

//Can have multiple pre save hooks

// tourSchema.pre('save', function (next) {
//this - refers to the document being created
//console.log(this)
//console.log('Will save the document...');
//next();
// });

// tourSchema.post('save', function (doc, next) {
//   console.log(doc); - the saved document
//   this - saved document
//    console.log(this.name);
//   next();
// });

//Creating a model for the defined schema
const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;

//In the next version, we'll be using the query middleware
