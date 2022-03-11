const db = require("../database");

const getUserById = async (loginid) => {
  const profile_query =
    "SELECT full_name, email, phone, cast(date_joined::DATE as TEXT) as date_joined FROM hikers.users WHERE loginid = $1";

  const user = await db.query(profile_query, [loginid]);
  if (!user || !user.rowCount) {
    throw "User not found.";
  }
  return user.rows[0];
};

const getWalletsByLoginId = async (loginid) => {
  const profile_query = "SELECT * from hikers.wallet WHERE loginid=$1";

  const user = await db.query(profile_query, [loginid]);
  if (!user || !user.rowCount) {
    throw "User not found";
  }

  const get_wallet_query = "SELECT * FROM hikers.wallet WHERE loginid = $1";
  const results = await db.query(get_wallet_query, [loginid]);
  if (!results || !results.rowCount) {
    throw "No wallet available for user.";
  }
  return results.rows;
};

const createWallet = async (currency, loginid) => {
  try {
    const create_wallet_query =
      "INSERT INTO hikers.wallet (currency, balance, loginid) VALUES ($1, $2, $3) RETURNING *";

    const result = await db.query(create_wallet_query, [currency, 0, loginid]);
    return result.rows[0];
  } catch (e) {
    if ((e.code = "23505")) {
      throw "Wallet already exists.";
    }

    throw "Error creating wallet.";
  }
};

const getWalletByCurrencyLoginId = async (currency, loginid) => {
  try {
    const get_wallet_query =
      "SELECT * FROM hikers.wallet WHERE loginid = $1 AND currency = $2";

    const result = await db.query(get_wallet_query, [loginid, currency]);
    return result.rows[0];
  } catch (e) {
    throw "Error fetching wallet.";
  }
};

const checkForExistingWallet = async (currency, loginid) => {
  return await getWalletByCurrencyLoginId(currency, loginid);
};

module.exports = {
  getUserById,
  getWalletsByLoginId,
  createWallet,
  getWalletByCurrencyLoginId,
  checkForExistingWallet,
};
