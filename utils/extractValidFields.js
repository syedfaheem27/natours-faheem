exports.extractValidFields = (obj, validFields) => {
  const valid = new Set(validFields);
  const res = {};

  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key) && valid.has(key)) {
      res[key] = obj[key];
    }
  }
  return res;
};
