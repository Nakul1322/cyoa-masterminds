const { Schema } = require("mongoose");
const {constants} = require('../utils/index')

const db = require("../config/database").getUserDB();

const transactionSchema = new Schema(
  {
    user_id: {
      type: Schema.Types.ObjectId,
      ref: "storys",
    },
    transaction_id: {
      type: String,
    },
    amount: {
      type: Number,
    },
    story_id: {
      type: Schema.Types.ObjectId,
      ref: "stories",
    },
    status: {
      type: Number,
      enum: constants.user_status,
      default: 1,
    },
    paymentMode: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const Transaction = db.model("transaction", transactionSchema);

module.exports = {
  model: Transaction,
};
