const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Tour = require('../models/tourModel');
const User = require('../models/userModel');
const Booking = require('../models/bookingModel');

const catchAsync = require('../utils/catchAsync');
const handleFactory = require('./handleFactory');

exports.getCheckoutSession = catchAsync(async (req, res, next) => {
  //Get the tour
  const tour = await Tour.findById(req.params.tourId);

  //Create a checkout session
  const product = await stripe.products.create({
    name: `${tour.name} Tour`,
    description: tour.summary,
    images: [
      `${req.protocol}://${req.get('host')}/img/tours/${tour.imageCover}`,
    ],
  });

  const price = await stripe.prices.create({
    product: product.id,
    unit_amount: tour.price * 100,
    currency: 'usd',
  });

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    success_url: `${req.protocol}://${req.get(
      'host',
    )}/my-bookings?alert=booking`,
    cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
    customer_email: req.user.email,
    client_reference_id: req.params.tourId,
    mode: 'payment',
    line_items: [
      {
        price: price.id,
        quantity: 1,
      },
    ],
  });

  //Send the session along with the response
  res.status(200).json({
    status: 'success',
    session,
  });
});

const createBookingCheckout = async session => {
  console.log('session');
  console.log(session);
  const tour = session.client_reference_id;

  const user = (await User.findOne({ email: session.customer_email })).id;

  const price = session.amount_total / 100;

  await Booking.create({ user, tour, price });
};

exports.webhookCheckout = (req, res, next) => {
  const signature = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET,
    );
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const checkoutSessionCompleted = event.data.object;
    createBookingCheckout(checkoutSessionCompleted);
  }

  res.status(200).json({ recieved: true });
};

exports.createBooking = handleFactory.createOne(Booking);
exports.getAllBookings = handleFactory.getAll(Booking);
exports.getBooking = handleFactory.getOne(Booking);
exports.updateBooking = handleFactory.updateOne(Booking);
exports.deleteBooking = handleFactory.deleteOne(Booking);
