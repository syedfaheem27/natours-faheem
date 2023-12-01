const mongoose = require('mongoose');

//Defining schema with schema options
const tourSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A Tour must have a name'],
      unique: true,
      trim: true,
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
    id: false, //Mongoose assigns each of your schemas an id virtual
    //getter by default which returns the document's _id field cast to a string, or in the case of ObjectIds, its hexString.
  },
);

//Virtual Properties - dynamically created from existing properties
//Not persisted in the database

tourSchema.virtual('durationWeeks').get(function () {
  // console.log(this); // it throws an error when i use the option toObject:{virtuals:true}

  if (!this.duration) return;
  //The above condition is for cases when u request specific fields where duration
  //isn't included and in such cases, durationWeeks will be null

  return (this.duration / 7).toFixed(2) * 1;
});

//Creating a model for the defined schema
const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;

//In the next version, we are going to use the document middleware provided by mongoose
