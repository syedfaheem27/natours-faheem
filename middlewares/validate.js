const Joi = require("joi");

const pick = require("../utils/pick");

const validate = schema => (req, res, next) => {
  if (Object.values(req.body).length !== 0 && !req.is("application/json"))
    return res.status(415).json({
      status: "error",
      message: "Supports JSON request body only",
    });

  const validSchema = pick(schema, ["body", "params", "query"]);

  const object = pick(req, Object.keys(validSchema));

  const { value, error } = Joi.compile(validSchema)
    .prefs({
      errors: { label: "key" },
    })
    .validate(object);

  if (error) {
    const errorMessage = error.details.map(detail => detail.message).join(",");
    return res.status(404).json({
      status: "fail",
      message: errorMessage,
    });
  }

  Object.assign(req, value);

  next();
};

module.exports = validate;
