const Router = require("express").Router;
const {
  getAccountWallets,
  createNewWallet,
  topupWallet,
  transferWallet,
} = require("../service/wallet.service");
const { validateToken } = require("../utils/jwt");

const walletRouter = Router();
walletRouter.use(validateToken);
walletRouter.route("/").get((req, res) => res.send("Wallet endpoint"));
walletRouter.route("/:loginid").post(getAccountWallets);
walletRouter.route("/create/:loginid").post(createNewWallet);
walletRouter.route("/topup/:walletId").post(topupWallet);

module.exports = walletRouter;
