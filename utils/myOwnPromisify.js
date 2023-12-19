module.exports = fn => (arg1, arg2) =>
  new Promise((resolve, reject) => {
    fn(arg1, arg2, (err, result) => {
      if (err) reject(err);

      if (result) resolve(result);
    });
  });
