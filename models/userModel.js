const crypto = require('crypto');

const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please tell us your name'],
  },
  email: {
    type: String,
    required: [true, 'Please provide your email'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email address'],
  },
  role: {
    type: String,
    enum: ['admin', 'user', 'guide', 'lead-guide'],
    default: 'user',
  },
  photo: String,
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 8,
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please confirm your password'],
    validate: {
      validator: function (val) {
        //this refers to the current document in this case
        //only for create and save
        return this.password === val;
      },
      message: 'Passwords are not the same ',
    },
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
});

userSchema.pre('save', async function (next) {
  //return if the password isn't updated
  //no need to perform encryption
  if (!this.isModified('password')) return next();

  //Encrypting the password before saving
  this.password = await bcrypt.hash(this.password, 12);

  //setting the confirm passwrod to undefined as it served its purpose
  this.passwordConfirm = undefined;

  next();
});

//Defining a method that's going to be available on all the user instances
userSchema.methods.correctPassword = async function (incomingPassword) {
  return await bcrypt.compare(incomingPassword, this.password);
};

//Another instance method to check if password has been changed recenlty
userSchema.methods.hasChangedPassword = function (JwtTimeStamp) {
  if (this.passwordChangedAt) {
    const passwordTimeStamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10,
    );

    return passwordTimeStamp < JwtTimeStamp;
  }

  return false;
};

userSchema.methods.generateResetPasswordToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
