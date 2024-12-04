const { promisify } = require("util");
const jwt = require("jsonwebtoken");

const generateJwt = async payload => {
  const asyncJwt = promisify(jwt.sign);

  const token = await asyncJwt({ ...payload }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

  return token;
};

module.exports = generateJwt;
