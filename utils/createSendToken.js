const generateJwt = require("./generateJwt");

const createSendToken = async (res, user) => {
  const token = await generateJwt({
    id: user._id,
  });

  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000,
    ),
    httpOnly: true,
  };

  if (process.env.NODE_ENV === "production") cookieOptions.secure = true;

  res.cookie("jwt", token, cookieOptions);

  user.password = undefined;
  res.status(201).json({
    status: "success",
    token,
    data: {
      user,
    },
  });
};

module.exports = createSendToken;
