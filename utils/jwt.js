const { sign, verify } = require("jsonwebtoken");
const { jwt_secret, jwt_expiry } = require("./jwt_config");

const createToken = (email, login_id) => {
  const accessToken = sign({ email, login_id }, jwt_secret, {
    expiresIn: parseInt(jwt_expiry),
  });
  return accessToken;
};

const validateToken = (req, res, next) => {
  const { token } = req.body;
  if (!token) {
    return res.status(400).json({ error: "User not Authenticated!" });
  }

  try {
    const validToken = verify(token, jwt_secret);
    if (validToken) {
      req.authenticated = true;
      return next();
    }
  } catch (err) {
    return res.status(400).json({ error: err });
  }
};

module.exports = { createToken, validateToken };
