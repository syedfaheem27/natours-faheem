const Joi = require("joi");

const { validImage, validMongoId } = require("./custom.validation");

const addTourSchema = {
  body: Joi.object().keys({
    name: Joi.string().required(),
    duration: Joi.number().required(),
    secret: Joi.boolean(),
    maxGroupSize: Joi.number().required(),
    difficulty: Joi.string()
      .valid("easy", "medium", "difficult")
      .default("easy"),
    ratingsAverage: Joi.number().min(1).max(5),
    ratingsQuantity: Joi.number().default(0),
    price: Joi.number().required(),
    priceDiscount: Joi.number().default(0),
    summary: Joi.string().required(),
    description: Joi.string(),
    imageCover: Joi.string()
      .custom(validImage, "image extension validation")
      .required(),
    images: Joi.array().items(
      Joi.string().custom(validImage, "image extension validation"),
    ),
    startDates: Joi.array().items(
      Joi.string()
        .pattern(/^\d{4}-\d{2}-\d{2},\d{2}:\d{2}$/)
        .required(),
    ),
  }),
};

const updateTourSchema = {
  body: Joi.object().keys({
    name: Joi.string(),
    duration: Joi.number(),
    maxGroupSize: Joi.number(),
    difficulty: Joi.string()
      .valid("easy", "medium", "difficult")
      .default("easy"),
    ratingsAverage: Joi.number().min(1).max(5),
    ratingsQuantity: Joi.number(),
    price: Joi.number(),
    priceDiscount: Joi.number().default(0),
    summary: Joi.string(),
    description: Joi.string(),
    imageCover: Joi.string().custom(validImage, "image extension validation"),
    images: Joi.array().items(
      Joi.string().custom(validImage, "image extension validation"),
    ),
    startDates: Joi.array().items(
      Joi.string().pattern(/^\d{4}-\d{2}-\d{2},\d{2}:\d{2}$/),
    ),
  }),
};

const mongoIdSchema = {
  params: Joi.object().keys({
    id: Joi.string().custom(validMongoId, "Mongo Id Validation"),
  }),
};

module.exports = { addTourSchema, updateTourSchema, mongoIdSchema };
