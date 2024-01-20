const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  tour: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tour',
    required: [true, 'A booking must belong to a tour'],
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'A booking must belong to a user'],
  },
  price: {
    type: Number,
    required: [true, 'A booking must have a price'],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  paid: {
    type: Boolean,
    default: true,
  },
});
//can't do a virtual populate here as the tour doesn't know about it's bookings

bookingSchema.pre(/^find/, function (next) {
  //Approach 1
  //   this.populate('user').populate('tour');

  //Approach 2
  this.populate('user').populate({
    path: 'tour',
    select: 'name',
  });

  next();
});

const Booking = mongoose.model('Booking', bookingSchema);
module.exports = Booking;
