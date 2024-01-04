const express = require('express');

const userController = require('../controllers/userController');
const authController = require('../controllers/authController');

const router = express.Router();

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

router.get(
  '/me',
  authController.protect,
  userController.getMe,
  userController.getUser,
);

//Defining route for updating data for the currently logged in user
router.patch('/updateMe', authController.protect, userController.updateMe);

//Route for deleting a user - making user inactive
router.delete('/deleteMe', authController.protect, userController.deleteMe);

//Using a protect middleware to protect all tours
router
  .route('/')
  .get(authController.protect, userController.getAllUsers)
  .post(userController.createUser);
router
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(
    authController.protect,
    authController.restrictTo('admin'),
    userController.deleteUser,
  );

module.exports = router;
