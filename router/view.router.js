const express = require("express");

const { getOverview, getTour } = require("../controllers/view.controller");

const router = express.Router();

router.get("/", getOverview);

router.get("/tour", getTour);

module.exports = router;
