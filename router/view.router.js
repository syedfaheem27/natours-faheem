const express = require("express");

const {
  getOverview,
  getTourDetail,
  getLoginPage,
  getSignUpPage,
} = require("../controllers/view.controller");
const { isLoggedIn, logOut } = require("../controllers/auth.controller");

const router = express.Router();
router.use(isLoggedIn);

router.get("/", getOverview);

router.get("/tour/:slug", getTourDetail);

router.get("/login", getLoginPage);
router.get("/logout", logOut);
router.get("/signup", getSignUpPage);

module.exports = router;
