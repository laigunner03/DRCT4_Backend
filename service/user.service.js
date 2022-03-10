const bcrypt = require("bcrypt");

const db = require("../database");
const { createToken, validateToken } = require("../utils/jwt");
const { createWallet } = require("./wallet.service");

// Shared
const getUserById = async (loginid) => {
  const profile_query =
    "SELECT full_name, email, phone, cast(date_joined::DATE as TEXT) as date_joined FROM hikers.users WHERE loginid = $1";

  return await db.query(profile_query, [loginid]);
};

// Services
const registerUser = async (req, res) => {
  const { username, fullname, email, password, date_joined } = req.body;
  if (!username || !fullname || !email || !password || !date_joined) {
    return res.send({ error: "You have missing required fields/parameters." });
  }

  const hashed_password = await bcrypt.hash(password, 10);
  const user_info = [username, fullname, email, hashed_password, date_joined];

  const register_query =
    "INSERT INTO hikers.users (username, full_name, email, password, date_joined) VALUES ($1, $2, $3, $4, $5) RETURNING *";

  let user_register;
  try {
    user_register = await db.query(register_query, [...user_info]);
    await createWallet("USD", user_register.rows[0].loginid);
  } catch (e) {
    if (e.code == "23505") {
      return res.send({
        error: "User email already in use.",
      });
    }
    return res.send({
      error: "Unable to register user. Please check your credentials.",
    });
  }

  return res.status(200).send({ message: "Registration Successful" });
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;
  const login_query =
    "SELECT loginid, username, full_name, email, password, phone, cast(date_joined::DATE as TEXT) as date_joined, user_img FROM hikers.users WHERE email = $1";

  try {
    const results = await db.query(login_query, [email]);
    if (!results.rowCount) {
      return res
        .status(400)
        .send({ message: "Wrong email/password combination!" });
    }

    const does_password_match = await bcrypt.compare(
      password,
      results.rows[0].password
    );
    if (!does_password_match) {
      return res
        .status(400)
        .send({ message: "Wrong email/password combination!" });
    }

    const { email: db_email, loginid } = results.rows[0];
    const access_token = createToken(db_email, loginid);

    //Store access-token in cookiie
    // res.cookie("access-token", access_token, {
    //   maxAge: 86400 * 1000, //expired in 1 day (ms)
    //   httpOnly: true,
    // });

    // Remove password from response.
    // Renamed it to removed_password because clashes with top declaration
    const { password: removed_password, ...filtered_result } = results.rows[0];
    console.log(filtered_result);

    return res.status(200).send({ token: access_token, ...filtered_result });
  } catch (e) {
    console.log(e);
    return res.send({ error: e });
  }
};

const getUserProfile = async (req, res) => {
  const { loginid } = req.params;

  const result = await getUserById(loginid);
  if (!result || !result.rowCount) {
    return res.send({ error: "User not found." });
  }

  return res.send({ ...result.rows[0] });
};

const updateUser = async (req, res) => {
  const { loginid } = req.params;
  const { full_name, email, phone } = req.body;

  if (!full_name || !email || !phone) {
    return res.send({ error: "You have missing required fields." });
  }

  const result = await getUserById(loginid);
  if (!result) {
    return res.send({ error: "User not found." });
  }

  const update_user_query =
    "UPDATE hikers.users SET full_name = $1, email = $2, phone = $3 WHERE loginid = $4";
  await db.query(update_user_query, [full_name, email, phone, loginid]);

  return res.send({ full_name, email, phone });
};

module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
  updateUser,
  getUserById,
};
