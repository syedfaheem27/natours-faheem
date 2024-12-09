const express = require("express");

const {
  getOverview,
  getTourDetail,
  getLoginPage,
  getUserDetail,
  getSignUpPage,
} = require("../controllers/view.controller");
const {
  isLoggedIn,
  logOut,
  protect,
} = require("../controllers/auth.controller");

const router = express.Router();

router.get("/", isLoggedIn, getOverview);

router.get("/tour/:slug", isLoggedIn, getTourDetail);

router.get("/login", isLoggedIn, getLoginPage);
router.get("/logout", isLoggedIn, logOut);
router.get("/signup", isLoggedIn, getSignUpPage);

router.get("/me", protect, getUserDetail);

module.exports = router;
