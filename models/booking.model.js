const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: "Tour",
      unique: true,
      required: [true, "A booking must have a corresponding tour"],
    },

    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: [true, "A booking must have a corresponding user"],
    },

    price: {
      type: Number,
      required: [true, "A booking must have a price"],
    },

    createdAt: {
      type: Date,
      default: Date.now,
    },

    paid: {
      type: Boolean,
      default: true,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// bookingSchema.pre(/^find/, function (next) {
//   console.log("finding");
//   this.populate("user").populate({
//     path: "tour",
//     select: "name",
//   });

//   next();
// });

// bookingSchema.virtual("tours", {
//   ref: "Tour",
//   foreignField: "_id",
//   localField: "tour",
//   options: {
//     select: "name price duration",
//   },
// });

// bookingSchema.virtual("vuser", {
//   ref: "User",
//   foreignField: "_id",
//   localField: "user",
// });

bookingSchema.index({ user: 1 });

const bookingModel = mongoose.model("Booking", bookingSchema);

module.exports = bookingModel;
