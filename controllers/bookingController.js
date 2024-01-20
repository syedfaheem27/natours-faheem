const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Tour = require('../models/tourModel');
const Booking = require('../models/bookingModel');

const catchAsync = require('../utils/catchAsync');

exports.getCheckoutSession = catchAsync(async (req, res, next) => {
  //Get the tour
  const tour = await Tour.findById(req.params.tourId);

  //Create a checkout session
  const product = await stripe.products.create({
    name: `${tour.name} Tour`,
    description: tour.summary,
    images: [`https://www.natours.dev/img/tours/${tour.imageCover}`],
  });

  const price = await stripe.prices.create({
    product: product.id,
    unit_amount: tour.price * 100,
    currency: 'usd',
  });

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    success_url: `${req.protocol}://${req.get('host')}/?tour=${
      req.params.tourId
    }&user=${req.user.id}&price=${tour.price}`,
    cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
    customer_email: req.user.email,
    client_reference_id: req.params.tourID,
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

//Temporary solution to create a booking on a successfull payment without a stripe webhook
//Unsafe as anyone who knows the structure of the success request can create a booking without a payment

//1. Pass the userId,tourId and the price as query params in the success url.

//2. Add a middleware in the review route for the GET request on the root path(/)
// as we are loading the review page after a successfull payment

//3. If there's no userId or no tourId or no Price, go to the next middleware

//4. Otherwise, create a booking in the DB and then if we just go to the next middleware
// which is the isLoggedIn and the getOverview, the overview oage will be loaded but the url
//will have the tourId,userId and the price as query params which is  not safe.

//5. To overcome this, after creating a booking, we will redirect to the root path (/)
//and since there won't be any tourId,userId or price, it will go to the next middleware and
//the overview page will load without these query params

exports.createBookingCheckout = catchAsync(async (req, res, next) => {
  const { tour, user, price } = req.query;

  if (!tour || !user || !price) return next();

  await Booking.create({ user, tour, price });

  res.redirect(req.originalUrl.split('?')[0]);
});
