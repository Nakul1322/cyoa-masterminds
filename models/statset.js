const { Schema } = require("mongoose");

const db = require("../config/database").getUserDB();

const statSetSchema = new Schema(
  {
    title: {
      type: String,
      unique:true
    },
    story_id: {
      type: Schema.Types.ObjectId,
      ref: "stories",
      default: null,
    },
    items: [
      {
        name: {
          type: String,
          unique:true
        },
        value: {
          type: Number
        },
        hidden: {
          type: Boolean,
          default: false,
        },
      },
    ],
    itemMaxCount: {
      type: Number
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const StatSet = db.model("statsets", statSetSchema);

module.exports = {
  model: StatSet,
};
