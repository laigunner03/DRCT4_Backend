const db = require("../database");
const { getUserById } = require("./user.service");
const {
  getWalletsByLoginId,
  getWalletByCurrencyLoginId,
  createWallet,
} = require("./wallet.service");
const { getCurrentCryptoPrice } = require("../external/binance");

// for getting transaction history for calculating P/L
const getUserTransactionById = async (req, res) => {
  const { loginid } = req.params;
  const get_profit_loss_query =
    "SELECT t.currency, t.type, t.current_price, t.quantity, t.wallet_id, w.loginid from hikers.transaction as t LEFT JOIN hikers.wallet as w on t.wallet_id = w.wallet_id WHERE w.loginid = $1";

  const result = await db.query(get_profit_loss_query, [loginid]);

  return res.status(200).send(result.rows);
};

const buyTransaction = async (req, res) => {
  const { loginid, currency, quantity } = req.body;
  if (!loginid || !currency || !quantity) {
    return res.send({ error: "You have missing required fields/parameters." });
  }

  if (!/^[A-Z]{3,4}$/.test(currency)) {
    return res.send({ error: "Invalid crypto currency." });
  }

  const wallets = await getWalletsByLoginId(loginid);
  if (wallets === null) {
    return res.send({ error: "User not found." });
  } else if (wallets.length < 1) {
    return res.send({ error: "No wallet available for user." });
  }

  const buy_wallet = wallets.find((w) => w.currency === "USD");
  let target_wallet = wallets.find((w) => w.currency === currency);
  if (!target_wallet) {
    await createWallet(currency, loginid);
    target_wallet = await getWalletByCurrencyLoginId(currency, loginid);
  }

  const crypto_price_usdt = await getCurrentCryptoPrice(currency);
  if (!crypto_price_usdt) {
    return res.send({ error: "Error fetching price feed." });
  }

  const total_price = crypto_price_usdt * Number.parseFloat(quantity);
  if (Number.parseFloat(buy_wallet.balance) < total_price) {
    return res.send({ error: "Not enough balance for transaction." });
  }
  const buy_balance = Number.parseFloat(buy_wallet.balance) - total_price;
  const target_balance =
    Number.parseFloat(target_wallet.balance) + Number.parseFloat(quantity);

  const update_balance_query =
    "UPDATE hikers.wallet SET balance = $1 WHERE wallet_id = $2";

  const one = await db.query(update_balance_query, [
    buy_balance,
    buy_wallet.wallet_id,
  ]);
  const two = await db.query(update_balance_query, [
    target_balance,
    target_wallet.wallet_id,
  ]);

  const transaction_query =
    "INSERT INTO hikers.transaction (currency, type, current_price, quantity, time, status, wallet_id) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *";

  const result = await db.query(transaction_query, [
    currency,
    "buy",
    crypto_price_usdt,
    Number.parseFloat(quantity),
    new Date(),
    "Success",
    target_wallet.wallet_id,
  ]);

  return res.send(result.rows[0]);
};

const sellTransaction = (req, res) => {};

module.exports = { buyTransaction, getUserTransactionById };
