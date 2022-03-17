const Router = require("express").Router;
const {
  registerUser,
  loginUser,
  getUserProfile,
  updateUser,
  updatePassword,
} = require("../service/user.service");
const { validateToken } = require("../utils/jwt");

const userRouter = Router();
userRouter.route("/").get((req, res) => res.send("User endpoint"));
userRouter.route("/register").post(registerUser);
userRouter.route("/login").post(loginUser);
userRouter
  .use(validateToken)
  .route("/update-password/:loginid")
  .post(updatePassword);
userRouter.use(validateToken).route("/profile/:loginid").post(getUserProfile);
userRouter
  .use(validateToken)
  .route("/profile/update/:loginid")
  .post(updateUser);

module.exports = userRouter;
