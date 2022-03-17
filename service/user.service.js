const bcrypt = require("bcrypt");
const db = require("../database/index");
const { createToken, validateToken } = require("../utils/jwt");
const { jwt_expiry } = require("../utils/jwt_config");
const { createWallet, getUserById } = require("./shared.service");

const registerUser = async (req, res) => {
  try {
    const { username, fullname, email, password, date_joined } = req.body;
    if (!username || !fullname || !email || !password || !date_joined) {
      throw "You have missing required fields/parameters.";
    }

    const hashed_password = await bcrypt.hash(password, 10);
    const user_info = [username, fullname, email, hashed_password, date_joined];

    const register_query =
      "INSERT INTO hikers.users (username, full_name, email, password, date_joined) VALUES ($1, $2, $3, $4, $5) RETURNING *";

    const user_register = await db.query(register_query, [...user_info]);
    await createWallet("USD", user_register.rows[0].loginid);

    return res.status(200).send({ message: "Registration Successful" });
  } catch (e) {
    if (e.code == "23505") {
      return res.send({ error: "User email already in use." });
    }

    return res.send({ error: e });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const login_query =
      "SELECT loginid, username, full_name, email, password, phone, cast(date_joined::DATE as TEXT) as date_joined FROM hikers.users WHERE email = $1";

    const results = await db.query(login_query, [email]);
    if (!results.rowCount) {
      throw "Wrong email/password combination!";
    }

    const does_password_match = await bcrypt.compare(
      password,
      results.rows[0].password
    );
    if (!does_password_match) {
      throw "Wrong email/password combination!";
    }

    const { email: db_email, loginid } = results.rows[0];
    const access_token = createToken(db_email, loginid);

    //Store access-token in cookiie
    // res.cookie("access-token", access_token, {
    //   domain: "tradehikers.xyz",
    //   maxAge: 300, //expired in 5min (s)
    //   httpOnly: true,
    //   secure: true,
    //   sameSite: "none",
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
  try {
    const { loginid } = req.params;
    const result = await getUserById(loginid);

    return res.send(result);
  } catch (e) {
    return res.send({ error: e });
  }
};

const updateUser = async (req, res) => {
  try {
    const { loginid } = req.params;
    const { full_name, email, phone } = req.body;
    console.log(req.body);

    if (!full_name || !email) {
      throw "You have missing required fields.";
    }

    await getUserById(loginid);

    const update_user_query =
      "UPDATE hikers.users SET full_name = $1, email = $2, phone = $3 WHERE loginid = $4 RETURNING *";
    const result = await db.query(update_user_query, [
      full_name,
      email,
      phone,
      loginid,
    ]);
    if (!result || !result.rowCount) {
      throw "Error in updating user profile.";
    }

    const { password, ...filtered_result } = result.rows[0];

    return res.send(filtered_result);
  } catch (e) {
    return res.send({ error: e });
  }
};

const updatePassword = async (req, res) => {
  const { loginid } = req.params;
  const { old_password, new_password } = req.body;

  const user_query = "SELECT * FROM hikers.users WHERE loginid = $1";

  const change_password_query =
    "UPDATE hikers.users SET password = $1 WHERE loginid = $2 RETURNING *";

  try {
    const results = await db.query(user_query, [loginid]);
    if (!results.rowCount) {
      throw "Sorry, please check your input fields";
    }

    const does_password_match = await bcrypt.compare(
      old_password,
      results.rows[0].password
    );
    if (!does_password_match) {
      throw "Wrong password inserted!";
    }

    const hashed_new_password = await bcrypt.hash(new_password, 10);
    const update_pwd = await db.query(change_password_query, [
      hashed_new_password,
      loginid,
    ]);

    if (!update_pwd.rowCount) {
      throw "Sorry, please check your input fields";
    }

    return res.status(200).send({
      message:
        "Password changed successfully. This will take effect on your next login.",
    });
  } catch (e) {
    console.log(e);
    return res.send({ error: e });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
  updateUser,
  updatePassword,
};
