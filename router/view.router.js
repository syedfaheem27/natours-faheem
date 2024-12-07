const express = require("express");

const {
  getOverview,
  getTourDetail,
} = require("../controllers/view.controller");

const router = express.Router();

router.get("/", getOverview);

router.get("/tour/:slug", getTourDetail);

module.exports = router;
