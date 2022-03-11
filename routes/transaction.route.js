const Router = require("express").Router;
const {
  buyTransaction,
  getUserTransactionById,
  sellTransaction,
} = require("../service/transaction.service");

const transactionRouter = Router();
transactionRouter
  .route("/")
  .get((req, res) => res.send("Transaction endpoint."));
transactionRouter.route("/buy").post(buyTransaction);
transactionRouter.route("/sell").post(sellTransaction);
transactionRouter.route("/:loginid").get(getUserTransactionById); //For p/l

module.exports = transactionRouter;
