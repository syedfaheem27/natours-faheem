const express = require('express');

const tourController = require('../controllers/tourController');

const router = express.Router();

//1.  Tours

//Alias Route
router
  .route('/top-5-cheap')
  .get(tourController.aliasTopCheap, tourController.getTours);

router.route('/').get(tourController.getTours).post(tourController.createTour);

//Tour-stats
router.route('/tour-stats').get(tourController.getTourStats);

//Monthly-plan
router.route('/monthly-plan/:year').get(tourController.getMonthlyPlan);

router
  .route('/:id')
  .get(tourController.getTour)
  .patch(tourController.updateTour)
  .delete(tourController.deleteTour);

module.exports = router;
