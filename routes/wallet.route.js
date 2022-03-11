const Router = require("express").Router;
const {
  getAccountWallets,
  createNewWallet,
  topupWallet,
  transferWallet,
} = require("../service/wallet.service");

const walletRouter = Router();
walletRouter.route("/").get((req, res) => res.send("Wallet endpoint"));
walletRouter.route("/:loginid").get(getAccountWallets);
walletRouter.route("/create/:loginid").post(createNewWallet);
walletRouter.route("/topup/:walletId").post(topupWallet);

module.exports = walletRouter;
