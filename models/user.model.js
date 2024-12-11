const crypto = require("crypto");

const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const { promisify } = require("util");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "A user must have a name"],
      minlength: [3, "A name must be atleast 3 characters in length"],
      maxlength: [30, "A name must not be more than 30 characters in length"],
    },
    email: {
      type: String,
      required: [true, "A user must have an email"],
      unique: [true, "No duplicate emails allowed"],
      lowercase: true,
      validate: {
        validator: function (val) {
          return /[A-Za-z0-9\._%+\-]+@[A-Za-z0-9\.\-]+\.[A-Za-z]{2,}/.test(val);
        },
        message: props => `${props.value} is not a valid email address.`,
      },
    },
    role: {
      type: String,
      default: "user",
      enum: {
        values: ["user", "admin", "guide", "lead-guide"],
        message: "A role must be one of user, admin, guide or lead-guide.",
      },
      // select: false,
    },
    active: {
      type: Boolean,
      default: true,
      select: false,
    },
    photo: {
      type: String,
      default: "default.jpg",
    },
    password: {
      type: String,
      required: [true, "Please provide a password."],
      minlength: [8, "A password must be atleast 8 characters in length."],
      select: false,
      validate: {
        validator: function (val) {
          if (!val.match(/\d/) || !val.match(/[a-zA-Z]/)) {
            return false;
          }
          return true;
        },
        message: "Password must contain at least 1 letter and 1 number",
      },
    },
    passwordConfirm: {
      type: String,
      required: [true, "Please provide a password confirm"],
      select: false,
      validate: {
        validator: function (val) {
          return this.password === val;
        },
        message: "Password and Password confirm must be equal.",
      },
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
  },
  {
    methods: {
      isCorrectPassword: async function (incomingPassword) {
        return await bcrypt.compare(incomingPassword, this.password);
      },
      hasChangedPasswordAfter: function (jwtTs) {
        if (!this.passwordChangedAt) return false;

        const passChangedTs = parseInt(
          this.passwordChangedAt.getTime() / 1000,
          10,
        );

        return passChangedTs > jwtTs;
      },
      createPasswordResetToken: function () {
        const resetToken = crypto.randomBytes(32).toString("hex");

        this.passwordResetToken = crypto
          .createHash("sha256")
          .update(resetToken)
          .digest("hex");

        this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

        return resetToken;
      },
    },
  },
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  this.password = await promisify(bcrypt.hash)(this.password, 12);
  this.passwordConfirm = undefined;

  next();
});

userSchema.pre("save", function (next) {
  if (!this.isModified("password") || this.isNew) return next();

  this.passwordResetToken = undefined;
  this.passwordResetExpires = undefined;

  this.passwordChangedAt = Date.now() - 1000;

  next();
});

// Delete exisiting user
// userSchema.pre("save", async function (next) {
//   console.log(this.get("photo"));

//   next();
// });

// userSchema.post("save", function (doc, next) {
//   console.log(doc.photo);
//   next();
// });

userSchema.pre(/^find/, function (next) {
  this.find({ active: { $ne: false } });

  next();
});

//TODO: Deleting the user pics when the pic is uploaded

const userModel = mongoose.model("User", userSchema);
module.exports = userModel;
