module.exports =
  fn =>
  (...args) =>
    new Promise((resolve, reject) => {
      fn(...args, (err, result) => {
        if (err) reject(err);

        if (result) resolve(result);
      });
    });
