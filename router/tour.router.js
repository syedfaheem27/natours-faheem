const express = require("express");
const {
  getAllTours,
  addTour,
  getTour,
  updateTour,
  deleteTour,
  // checkId,
  getMonthlyTourPlan,
  getTourStats,
  getToursWithin,
  getTourDistances,
} = require("../controllers/tours.controller");

const reviewRouter = require("./review.router");
// const {
//   addTourSchema,
//   updateTourSchema,
//   // updateTourSchema,
//   // mongoIdSchema,
// } = require("../validation/tour.validation");

// const validate = require("../middlewares/validate");
const { protect, restrictTo } = require("../controllers/auth.controller");

const { top5Cheap } = require("../middlewares/tours");

const router = express.Router();

router.use("/:tourId/reviews", reviewRouter);

router.route("/top-5-cheap").get(top5Cheap, getAllTours);
router.route("/tour-stats").get(getTourStats);
router.route("/monthly-plan/:year").get(protect, getMonthlyTourPlan);
router
  .route("/tours-within/:distance/center/:latlng/unit/:unit")
  .get(getToursWithin);

router.route("/center/:latlng/unit/:unit").get(getTourDistances);

router.route("/").get(getAllTours).post(
  protect,
  restrictTo("admin", "lead-guide"),
  // validate(addTourSchema),
  addTour,
);

//Param middleware
// router.param("id", checkId);

router
  .route("/:id")
  // .get(validate(mongoIdSchema), getTour)
  .get(getTour)
  //Handling invalid ids in the global error handler
  //as well which is not necessary given the fact that we have JOI validating our inputs
  // .patch(validate(updateTourSchema), updateTour)
  //Testing our global error handler for different kinds of erros
  .patch(
    protect,
    restrictTo("admin", "lead-guide", "guide"),
    // validate(updateTourSchema),
    updateTour,
  )
  .delete(protect, restrictTo("admin", "lead-guide"), deleteTour);

module.exports = router;
