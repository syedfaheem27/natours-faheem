const mongoose = require("mongoose");

const stripe = require("stripe")(process.env.STRIPE_SECRET);

const Tour = require("../models/tour.model");
const Booking = require("../models/booking.model");

const catchAsync = require("../utils/catchAsync");
const {
  createOne,
  getOne,
  updateOne,
  deleteOne,
} = require("./handler.factory");

exports.getCheckoutSession = catchAsync(async (req, res, next) => {
  const tour = await Tour.findById(req.params.tourId);

  const product = await stripe.products.create({
    name: `${tour.name} Tour`,
    description: tour.summary,
    images: [
      `${req.protocol}://${req.get("host")}/img/tours/${tour.imageCover}`,
    ],
  });

  const price = await stripe.prices.create({
    product: product.id,
    unit_amount: tour.price * 100,
    currency: "usd",
  });

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    success_url: `${req.protocol}://${req.get("host")}/?tour=${tour.id}&user=${req.user.id}&price=${tour.price}`,
    cancel_url: `${req.protocol}://${req.get("host")}/tour/${tour.slug}`,
    customer_email: req.user.email,
    client_reference_id: req.params.tourId,
    line_items: [
      {
        price: price.id,
        quantity: 1,
      },
    ],
  });

  res.status(200).json({
    status: "success",
    data: {
      session,
    },
  });
});

exports.createBookingCheckout = catchAsync(async (req, res, next) => {
  const { tour, user, price } = req.query;

  if (!tour && !user && !price) return next();

  await Booking.create({ tour, user, price });

  res.redirect(req.originalUrl.split("?")[0]);
});

//can do virtual populate or individually populate
exports.getMyBookings = (responseIdentifier = "render") =>
  catchAsync(async (req, res, next) => {
    // const bookingsI = await Booking.find({ user: req.user.id });

    // return res.status(200).json({
    //   bookings: bookingsI,
    // });
    let bookings = Booking.aggregate([
      {
        $match: {
          user: new mongoose.Types.ObjectId(req.user.id), // Match user field
        },
      },
      {
        $lookup: {
          from: "tours", // Collection name (plural of model name)
          localField: "tour", // Field in Booking schema
          foreignField: "_id", // Field in Tour schema
          as: "tourDetails", // Output field to store populated tours
        },
      },
      {
        $project: {
          tourDetails: 1,
        },
      },
      // {
      //   $unwind: {
      //     path: "$tourDetails", // Flatten the array to get a single tour object
      //     preserveNullAndEmptyArrays: true, // Handle cases where no tour is found
      //   },
      // },
      {
        $project: {
          name: "$tourDetails.name", // Extract 'name' from 'tourDetails' and place it on the outer object
          duration: "$tourDetails.duration",
          price: "$tourDetails.price",
          description: "$tourDetails.description",
          imageCover: "$tourDetails.imageCover",
          images: "$tourDetails.images",
          createdAt: "$tourDetails.createdAt",
          difficulty: "$tourDetails.difficulty",
          summary: "$tourDetails.summary",
          startLocation: "$tourDetails.startLocation",
          startDates: "$tourDetails.startDates",
          locations: "$tourDetails.locations",
          slug: "$tourDetails.slug",
        },
      },
    ]);

    const unwindStages = [
      "name",
      "duration",
      "price",
      "description",
      "imageCover",
      "images",
      "createdAt",
      "difficulty",
      "summary",
      "startLocation",
      "startDates",
      "locations",
      "slug",
    ];

    unwindStages.forEach(stage => {
      bookings._pipeline.push({
        $unwind: `$${stage}`,
      });
    });

    bookings = await bookings;

    if (responseIdentifier === "api")
      return res.status(200).json({
        status: "success",
        data: {
          data: bookings,
        },
      });

    res.status(200).render("overview", {
      title: "My bookings",
      tours: bookings,
    });
  });

//for admin - add tour,user on body
exports.createBooking = createOne(Booking, ["tour", "user", "price"]);
exports.getBooking = getOne(Booking, [
  {
    path: "tour",
  },
]);

exports.updateBooking = updateOne(Booking, ["tour", "user", "price"]);
exports.deleteBooking = deleteOne(Booking);
