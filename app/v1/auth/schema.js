const Joi = require("joi");
const pwd =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%#*?&])[A-Za-z\d@$!%*#?&]{8,25}$/;

const login = Joi.object().keys({
  email: Joi.string().trim().email().lowercase().optional(),
  password: Joi.string().optional(),
  device_id: Joi.string().required(),
  device_type: Joi.string().required(),
  device_token: Joi.string().required(),
  story_id: Joi.string().optional(),
});

const verifyOTP = Joi.object().keys({
  email: Joi.string().trim().email().lowercase().required(),
  otp: Joi.string().required(),
});

const sendOTP = Joi.object().keys({
  email: Joi.string().trim().email().lowercase().required(),
});

const forgotPassword = Joi.object().keys({
  email: Joi.string().trim().email().lowercase().required(),
});

const resetPassword = Joi.object().keys({
  oldPassword: Joi.string().optional(),
  newPassword: Joi.string().required().regex(pwd),
});

const creatorSignup = Joi.object().keys({
  password: Joi.string().required().regex(pwd),
});

const sendInvite = Joi.object().keys({
  name: Joi.string().trim().min(2).max(50).required(),
  email: Joi.string().trim().email().lowercase().required(),
});



module.exports = {
  verifyOTP,
  forgotPassword,
  resetPassword,
  login,
  sendOTP,
  creatorSignup,
  sendInvite,
  //getEmail
};