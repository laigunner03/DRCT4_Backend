const isValidUUID = (string) => {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    string
  );
};

const isValidCrypto = (code) => {
  return /^[A-Z]{3,4}$/.test(code);
};

module.exports = { isValidUUID, isValidCrypto };
