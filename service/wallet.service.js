const res = require("express/lib/response");
const db = require("../database");
const {
  getWalletsByLoginId,
  getWalletByCurrencyLoginId,
  createWallet,
  checkForExistingWallet,
} = require("./shared.service");
const { isValidUUID } = require("../utils/validation");

const getAccountWallets = async (req, res) => {
  try {
    const { loginid } = req.params;
    if (!loginid) {
      throw "No loginid specified.";
    }
    const wallets = await getWalletsByLoginId(loginid);
    return res.send(wallets);
  } catch (e) {
    res.status(500).send({ error: e });
  }
};

const createNewWallet = async (req, res) => {
  try {
    const { loginid } = req.params;
    const { currency } = req.body;
    let parsed_currency = currency;

    if (!loginid) {
      throw "You have missing required fields/parameters.";
    }
    if (!currency) {
      parsed_currency = "USD";
    }

    const profile_query = "SELECT * from hikers.wallet	WHERE loginid=$1";

    const user = await db.query(profile_query, [loginid]);
    if (!user || !user.rowCount) {
      return res.send({ error: "User not found." });
    }

    const existing_wallet = await checkForExistingWallet(
      parsed_currency,
      loginid
    );
    if (existing_wallet) {
      throw "Existing wallet already exist.";
    }

    await createWallet(parsed_currency, loginid);
    const wallets = await getWalletsByLoginId(loginid);
    const wallet = wallets.find((w) => w.currency === currency);
    return res.send(wallet);
  } catch (e) {
    return res.status(500).send({ error: e });
  }
};

const topupWallet = async (req, res) => {
  try {
    const { walletId } = req.params;
    if (!walletId || !isValidUUID(walletId)) {
      throw "Invalid wallet id";
    }

    const { amount, currency } = req.body;
    if (!amount || !currency) {
      throw "You have missing required fields/parameters.";
    }

    const topup_ammount = Number.parseFloat(amount);
    if (topup_ammount < 0) {
      throw "Invalid amount.";
    }

    const get_wallet_id_query =
      "SELECT * FROM hikers.wallet WHERE wallet_id = $1";
    const result = await db.query(get_wallet_id_query, [walletId]);
    if (!result.rowCount) {
      throw "Wallet not found.";
    }

    const {
      wallet_id,
      balance: target_balance,
      currency: target_currency,
      loginid,
    } = result.rows[0];
    if (currency !== target_currency) {
      throw "Currency mismatch.";
    }

    const new_balance = Number.parseFloat(target_balance) + topup_ammount;
    const update_wallet_query =
      "UPDATE hikers.wallet SET balance = $1 WHERE wallet_id = $2";
    await db.query(update_wallet_query, [new_balance, wallet_id]);

    return res.send({
      wallet_id,
      currency: target_currency,
      balance: new_balance,
      loginid,
    });
  } catch (e) {
    res.status(500).send({ error: e });
  }
};

module.exports = {
  getAccountWallets,
  createNewWallet,
  topupWallet,
  getWalletsByLoginId,
  getWalletByCurrencyLoginId,
  createWallet,
};
