const Joi = require("joi");

const { validPassword, validImage } = require("./custom.validation");

exports.signUpSchema = {
  body: Joi.object().keys({
    name: Joi.string().min(3).max(30).required(),
    email: Joi.string().email().required(),
    password: Joi.string()
      .custom(validPassword, "Password validation")
      .required(),
    passwordConfirm: Joi.string()
      .valid(Joi.ref("password"))
      .required()
      .messages({ "any.only": "Passwords do not match" }),
    role: Joi.string()
      .allow("user", "admin", "guide", "lead-guide")
      .default("user"),
    active: Joi.boolean().default(true),
    photo: Joi.string().custom(validImage, "Image extension validation"),
  }),
};

exports.updateUserSchema = {
  body: Joi.object()
    .keys({
      name: Joi.string().min(3).max(30),
      email: Joi.string().email(),
      photo: Joi.string().custom(validImage, "Image extension validation"),
      active: Joi.boolean(),
      role: Joi.string().allow("user", "admin", "guide", "lead-guide"),
      password: Joi.string().custom(validPassword, "Password validation"),
      passwordConfirm: Joi.string()
        .valid(Joi.ref("password"))
        .messages({ "any.only": "Passwords do not match" }),
    })
    .or("name", "email", "photo", "active", "role")
    .with("password", "passwordConfirm"),
};

exports.logInSchema = {
  body: Joi.object().keys({
    email: Joi.string().email().required(),
    password: Joi.string()
      .custom(validPassword, "Password validation")
      .required(),
  }),
};
