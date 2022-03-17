const db = require("./index");

const setupDBFunctions = async () => {
  await db.query(`
  CREATE OR REPLACE FUNCTION public.uuid_generate_v4(
    )
      RETURNS uuid
      LANGUAGE 'c'
      COST 1
      VOLATILE STRICT PARALLEL SAFE 
  AS '$libdir/uuid-ossp', 'uuid_generate_v4';
  `);
};

const setupUserTable = async () => {
  await db.query(`
    CREATE SCHEMA IF NOT EXISTS hikers;
    CREATE SEQUENCE IF NOT EXISTS user_id_seq;
    CREATE TABLE IF NOT EXISTS hikers.users
    (
        loginid TEXT NOT NULL DEFAULT (('HKR'::text || to_char((CURRENT_DATE)::timestamp with time zone, 'YYYYMMDD'::text)) || lpad((nextval('user_id_seq'::regclass))::text, 18, '0'::text)),
        username VARCHAR(16) NOT NULL,
        full_name VARCHAR(50) NOT NULL,
        email TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        phone TEXT,
        date_joined TIMESTAMPTZ,
        PRIMARY KEY (loginid),
        UNIQUE (email)
    );
  `);

  await db.query("GRANT ALL ON hikers.users to postgres;");
};

const setupWalletTable = async () => {
  await db.query(`
    CREATE TABLE IF NOT EXISTS hikers.wallet
    (
        wallet_id uuid NOT NULL DEFAULT uuid_generate_v4(),
        currency TEXT NOT NULL,
        balance DOUBLE PRECISION NOT NULL DEFAULT '0'::numeric,
        "loginid" TEXT,
        PRIMARY KEY (wallet_id),
        FOREIGN KEY ("loginid")
            REFERENCES hikers.users (loginid) 
            ON UPDATE NO ACTION
            ON DELETE NO ACTION
    );
`);

  await db.query("GRANT ALL ON hikers.wallet to postgres;");
};

const setupTransactionTable = async () => {
  await db.query(`
  CREATE TABLE IF NOT EXISTS hikers.transaction
  (
      id uuid NOT NULL DEFAULT uuid_generate_v4(),
      currency TEXT NOT NULL,
      transaction_type TEXT NOT NULL,
      current_price DOUBLE PRECISION NOT NULL DEFAULT '0'::numeric,
      quantity DOUBLE PRECISION NOT NULL DEFAULT '0'::numeric,
      transaction_time TIMESTAMPTZ NOT NULL,
      status TEXT NOT NULL,
      "wallet_id" uuid,
      PRIMARY KEY (id),
      FOREIGN KEY ("wallet_id")
          REFERENCES hikers.wallet (wallet_id) 
          ON UPDATE NO ACTION
          ON DELETE NO ACTION
  )`);
};

(async () => {
  try {
    await setupDBFunctions();
  } catch (e) {
    console.log("Error setting up functions: " + e);
  }

  console.log("Setting up User table...");
  try {
    await setupUserTable();
  } catch (e) {
    console.log("Error setting up User table: " + e);
  }

  console.log("Setting up Wallet table...");
  try {
    await setupWalletTable();
  } catch (e) {
    console.log("Error setting up Wallet table: " + e);
  }

  console.log("Setting up Transaction table...");
  try {
    await setupTransactionTable();
  } catch (e) {
    console.log("Error setting up Transaction table: " + e);
  }
})();
