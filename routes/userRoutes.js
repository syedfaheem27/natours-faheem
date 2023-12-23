const express = require('express');

const userController = require('../controllers/userController');
const authController = require('../controllers/authController');

const router = express.Router();

//Adding a unique end point for sign up which doesn't follow the
//express way of defining routes as defined below because this is
//a special route only to be used for signing user and you can only
//post requests to the endpoint
router.post('/signup', authController.signUp);
router.post('/login', authController.logIn);

//Defining routes for forgetting and resetting password
router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword/:token', authController.resetPassword);

//Defining route for updating password of the current user
router.patch(
  '/updateMyPassword',
  authController.protect,
  authController.updatePassword,
);

//Defining route for updating data for the currently logged in user
router.patch('/updateMe', authController.protect, userController.updateMe);

//let's try to use a protect middleware to protect all tours
router
  .route('/')
  .get(authController.protect, userController.getAllUsers)
  .post(userController.createUser);
router
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = router;
