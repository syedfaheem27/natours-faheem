const express = require("express");

const { protect, restrictTo } = require("../controllers/auth.controller");

const {
  getCheckoutSession,
  getMyBookings,
  createBooking,
  updateBooking,
  deleteBooking,
  getBooking,
} = require("../controllers/bookings.controller");

const router = express.Router();

router.get("/checkout-session/:tourId", protect, getCheckoutSession);

router.use(protect);

router.use(restrictTo("admin", "lead-guide"));

router
  .route("/")
  .get((req, res, next) => {
    getMyBookings("api")(req, res, next);
  })
  .post(createBooking);

router.route("/:id").get(getBooking).patch(updateBooking).delete(deleteBooking);

module.exports = router;
