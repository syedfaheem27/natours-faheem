const express = require('express');

const tourController = require('../controllers/tourController');

const router = express.Router();

//Param middleware
router.param('id', tourController.checkID);

//Adding a middleware to check if the request body contains name and price property before
//creating a tour. If not - send 400 (bad request)

//1.  Tours
router
  .route('/')
  .get(tourController.getTours)
  .post(tourController.checkBody, tourController.createTour);
router
  .route('/:id')
  .get(tourController.getTour)
  .patch(tourController.updateTour)
  .delete(tourController.deleteTour);

module.exports = router;
