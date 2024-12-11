const express = require("express");

const { protect, restrictTo } = require("../controllers/auth.controller");

const { getCheckoutSession } = require("../controllers/bookings.controller");

const router = express.Router();

router.get(
  "/checkout-session/:tourId",
  protect,
  restrictTo("user", "lead-guide", "guide"),
  getCheckoutSession,
);

module.exports = router;
