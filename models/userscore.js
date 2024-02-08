const { Schema } = require("mongoose");

const db = require("../config/database").getUserDB();

const userScoreSchema = new Schema(
  {
    user_id: {
      type: Schema.Types.ObjectId,
      ref: "users",
    },
    story_id: {
      type: Schema.Types.ObjectId,
      ref: "stories",
    },
    baseline: [
      {
        title: {
          type: String,
          trim: true,
        },
        value: {
          type: Number,
        },
      },
    ],
    statset: [
      {
        title: {
          type: String
        },
        items: [
          {
            name: {
              type: String
            },
            value: {
              type: Number,
            },
          },
        ],
      },
    ],
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const UserScore = db.model("userscores", userScoreSchema);

module.exports = {
  model: UserScore,
};
