const Router = require("express").Router;
const {
  registerUser,
  loginUser,
  getUserProfile,
  updateUser,
  updatePassword,
} = require("../service/user.service");

const userRouter = Router();
userRouter.route("/").get((req, res) => res.send("User endpoint"));
userRouter.route("/register").post(registerUser);
userRouter.route("/login").post(loginUser);
userRouter.route("/update-password/:loginid").post(updatePassword);
userRouter.route("/profile/:loginid").get(getUserProfile);
userRouter.route("/profile/:loginid").post(updateUser);

module.exports = userRouter;
