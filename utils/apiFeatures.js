const pick = require("./pick");

class APIFeatures {
  constructor(query, queryObj) {
    this.query = query;
    this.queryObj = queryObj;
  }

  filter() {
    const filterQuery = pick({ ...this.queryObj }, [
      "duration",
      "price",
      "ratingsAverage",
      "difficulty",
    ]);

    //1B ADVANCED FILTERING
    const queryStr = JSON.stringify(filterQuery).replace(
      /\b(gt|gte|lte|lte)\b/g,
      match => `$${match}`,
    );

    this.query = this.query.find(JSON.parse(queryStr));
    return this;
  }

  sort() {
    if (this.queryObj.sort) {
      const sortBy = this.queryObj.sort.replace(/,/g, () => " ");
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort("-createdAt");
    }

    return this;
  }

  select() {
    if (this.queryObj.select) {
      const selectBy = this.queryObj.fields.replace(/,/g, () => " ");
      this.query = this.query.select(selectBy);
    }
    this.query = this.query.select("-__v");
    return this;
  }

  paginate() {
    const page = this.queryObj.page * 1 || 1;
    const limit = this.queryObj.limit * 1 || 10;
    const skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);

    return this;
  }
}
module.exports = APIFeatures;
