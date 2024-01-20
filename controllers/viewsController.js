const Tour = require('../models/tourModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const Booking = require('../models/bookingModel');

exports.getOverview = catchAsync(async (req, res, next) => {
  const tours = await Tour.find();

  res.status(200).render('overview', {
    title: 'All tours',
    tours,
  });
});

exports.getTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findOne({ slug: req.params.slug }).populate({
    path: 'reviews',
    select: 'review rating user',
  });

  if (!tour) return next(new AppError('There is no tour with that name', 404));

  res.status(200).render('tour', {
    title: `${tour.name} Tour`,
    tour,
  });
});

exports.getLoginForm = (req, res) => {
  res.status(200).render('login', {
    title: 'Log into your account',
  });
};

exports.getAccount = (req, res) => {
  res.status(200).render('account', {
    title: 'Your Account',
  });
};

//Approach 1 - In the bookingModel, while populating the tour in a pre find
//query, populate the tour with all the fields.

// exports.getMyBookings = catchAsync(async (req, res, next) => {
//   //Get bookings
//   const bookings = await Booking.find({ user: req.user.id });

//   const tours = bookings.map(el => el.tour);

//   res.status(200).render('overview', {
//     title: 'My Bookings',
//     tours,
//   });
// });

//Approach 2 - Getting the tours out of the tourIds from the bookings

exports.getMyBookings = catchAsync(async (req, res, next) => {
  const bookings = await Booking.find({ user: req.user.id });
  const tourIds = bookings.map(el => el.tour._id);

  const tours = await Tour.find({ _id: { $in: tourIds } });

  res.status(200).render('overview', {
    title: 'My Bookings',
    tours,
  });
});
