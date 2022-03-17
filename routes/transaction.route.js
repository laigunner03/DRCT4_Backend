const Router = require("express").Router;
const {
  buyTransaction,
  getUserTransactionById,
  sellTransaction,
} = require("../service/transaction.service");
const { validateToken } = require("../utils/jwt");

const transactionRouter = Router();
transactionRouter.use(validateToken);
transactionRouter
  .route("/")
  .get((req, res) => res.send("Transaction endpoint."));
transactionRouter.route("/buy").post(buyTransaction);
transactionRouter.route("/sell").post(sellTransaction);
transactionRouter.route("/:loginid").post(getUserTransactionById); //For p/l

module.exports = transactionRouter;
