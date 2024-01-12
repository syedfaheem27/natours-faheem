const express = require('express');

const userController = require('../controllers/userController');
const authController = require('../controllers/authController');

const router = express.Router();

//post requests to the endpoint
router.post('/signup', authController.signUp);
router.post('/login', authController.logIn);
router.get('/logout', authController.logOut);

//Defining routes for forgetting and resetting password
router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword/:token', authController.resetPassword);

//This middleware protects all the ones after
router.use(authController.protect);

//Defining route for updating password of the current user
router.patch('/updateMyPassword', authController.updatePassword);

router.get('/me', userController.getMe, userController.getUser);

//Defining route for updating data for the currently logged in user
router.patch('/updateMe', userController.updateMe);

//Route for deleting a user - making user inactive
router.delete('/deleteMe', userController.deleteMe);

//Only admin should have access to the routes down below
router.use(authController.restrictTo('admin'));

router
  .route('/')
  .get(userController.getAllUsers)
  .post(userController.createUser);
router
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = router;
