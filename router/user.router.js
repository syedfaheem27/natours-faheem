const express = require("express");
const {
  getAllUsers,
  addUser,
  getUser,
  updateUser,
  deleteUser,
  updateMe,
  deleteMe,
  uploadUserPhoto,
  resizeUserPhoto,
} = require("../controllers/users.controller");
const {
  signUp,
  logIn,
  protect,
  restrictTo,
  forgotPassword,
  resetPassword,
  updateUserPassword,
} = require("../controllers/auth.controller");
// const validate = require("../middlewares/validate");
// const {
//   signUpSchema,
//   logInSchema,
//   updateUserSchema,
// } = require("../validation/user.validation");
const { filterPassAndPassConf, getMe } = require("../middlewares/users");

const router = express.Router();

//routes for a user to signup and login
router.post(
  "/signup",
  //  validate(signUpSchema),
  signUp,
);
router.post(
  "/login",
  // validate(logInSchema),
  logIn,
);

router.post("/forgotPassword", forgotPassword);
router.patch("/resetPassword/:token", resetPassword);

router.use(protect);

router.get("/me", getMe, getUser);
router.patch("/updatePassword", updateUserPassword);
// router.patch("/updateMe", uploadUserPhoto, resizeUserPhoto, updateMe);
router.patch("/updateMe", uploadUserPhoto, resizeUserPhoto, updateMe);

router.delete("/deleteMe", deleteMe);

//for admin and lead guides and guides

router.use(restrictTo("admin"));
router.route("/").get(getAllUsers).post(
  //  validate(signUpSchema),
  addUser,
);

router
  .route("/:id")
  .get(getUser)
  .patch(
    filterPassAndPassConf,
    // validate(updateUserSchema),
    updateUser,
  )
  .delete(deleteUser);

module.exports = router;
