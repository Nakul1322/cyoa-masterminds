const { Schema } = require("mongoose");
const { constants } = require("../utils/index");

const db = require("../config/database").getUserDB();

const userSchema = new Schema(
  {
    name: {
      type: String,
    },
    email: {
      type: String,
    },
    password: {
      type: String,
    },
    status: {
      type: Number,
      enum: constants.user_status,
      default: 1,
    },
    user_type: {
      type: Number,
      enum: constants.user_type,
      default: 1,
    },
    otp: {
      type: Number,
      expiresIn: "1m",
      index: true,
    },
    device_info: [
      {
        device_id: String,
        device_token: String,
        device_type: String,
        jwt: String,
      },
    ],
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const User = db.model("users", userSchema);

module.exports = {
  model: User,
};
