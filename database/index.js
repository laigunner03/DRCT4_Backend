const Pool = require("pg").Pool;
const { db_user, db_password, db_name } = require("./config");

const db = new Pool({
  user: db_user,
  password: db_password,
  host: "ec2-34-242-89-204.eu-west-1.compute.amazonaws.com",
  database: db_name,
});

module.exports = db;
