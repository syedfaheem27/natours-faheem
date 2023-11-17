const express = require('express');

const tourController = require('../controllers/tourController');

const tourRouter = express.Router();

//1.  Tours
tourRouter
  .route('/')
  .get(tourController.getTours)
  .post(tourController.createTour);
tourRouter
  .route('/:id')
  .get(tourController.getTour)
  .patch(tourController.updateTour)
  .delete(tourController.deleteTour);

module.exports = tourRouter;
