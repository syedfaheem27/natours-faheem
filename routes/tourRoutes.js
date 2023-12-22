const express = require('express');

const tourController = require('../controllers/tourController');
const authController = require('../controllers/authController');

const router = express.Router();

//1.  Tours

//Alias Route
router
  .route('/top-5-cheap')
  .get(tourController.aliasTopCheap, tourController.getTours);

//Tour-stats
router.route('/tour-stats').get(tourController.getTourStats);

//Monthly-plan
router.route('/monthly-plan/:year').get(tourController.getMonthlyPlan);

router
  .route('/')
  .get(authController.protect, tourController.getTours)
  .post(tourController.createTour);

router
  .route('/:id')
  .get(tourController.getTour)
  .patch(tourController.updateTour)
  .delete(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.deleteTour,
  );

module.exports = router;
