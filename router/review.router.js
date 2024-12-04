const express = require("express");

const {
  getAllReviews,
  addReview,
  getReview,
  updateReview,
  deleteReview,
} = require("../controllers/reviews.controller");

const { protect, restrictTo } = require("../controllers/auth.controller");
const {
  addTourUserIds,
  addTourUserBody,
  // preventDuplicateReviews,
} = require("../middlewares/reviews");

const router = express.Router({ mergeParams: true });

router.use(protect);

router.route("/").get(addTourUserIds, getAllReviews).post(
  restrictTo("user"),
  addTourUserBody,
  // preventDuplicateReviews,
  addReview,
);

router
  .route("/:id")
  .get(getReview)
  .patch(restrictTo("user", "admin"), updateReview)
  .delete(restrictTo("user", "admin"), deleteReview);

module.exports = router;
