const { Schema } = require("mongoose");

const db = require("../config/database").getUserDB();

const userChoiceSchema = new Schema(
  {
    user_id: {
      type: Schema.Types.ObjectId,
      ref: "users",
    },
    story_id: {
      type: Schema.Types.ObjectId,
      ref: "stories",
    },
    userChoices: [
      {
        scene_id: {
          type: Schema.Types.ObjectId,
          ref: "scenes",
        },
        choice_id: {
          type: Schema.Types.ObjectId,
          ref: "choices",
        },
      },
    ],
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const UserChoice = db.model("userchoices", userChoiceSchema);

module.exports = {
  model: UserChoice,
};
