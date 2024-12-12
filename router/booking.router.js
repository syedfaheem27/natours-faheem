const express = require("express");

const { protect } = require("../controllers/auth.controller");

const { getCheckoutSession } = require("../controllers/bookings.controller");

const router = express.Router();

router.get("/checkout-session/:tourId", protect, getCheckoutSession);

module.exports = router;
