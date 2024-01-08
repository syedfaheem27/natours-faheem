const express = require('express');

const tourController = require('../controllers/tourController');
const authController = require('../controllers/authController');
const reviewRouter = require('./reviewRoutes');

const router = express.Router();

//1.  Tours

//Nested Routes

//POST /tour/tourId/reviews
//GET /tour/tourId/reviews
//GET /tour/tourId/reviews/reviewId

//A better way to handle nested routes
//It re-routes back to the reviewRouter
router.use('/:tourId/reviews', reviewRouter);

//Alias Route
router
  .route('/top-5-cheap')
  .get(tourController.aliasTopCheap, tourController.getTours);

//Tour-stats
router.route('/tour-stats').get(tourController.getTourStats);

//Monthly-plan
router
  .route('/monthly-plan/:year')
  .get(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide', 'guide'),
    tourController.getMonthlyPlan,
  );

//Geo-spatial queries - end point
router
  .route('/tours-within/:distance/center/:latlng/unit/:unit')
  .get(tourController.getGeoData);

router
  .route('/')
  .get(tourController.getTours)
  .post(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.createTour,
  );

router
  .route('/:id')
  .get(tourController.getTour)
  .patch(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.updateTour,
  )
  .delete(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.deleteTour,
  );

module.exports = router;
