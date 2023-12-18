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
