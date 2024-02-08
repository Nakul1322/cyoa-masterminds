const { Schema } = require("mongoose");

const db = require("../config/database").getUserDB();

const sceneSchema = new Schema(
  {
    scene_name: {
      type: String
    },
    story_id: {
      type: Schema.Types.ObjectId,
      ref: "stories",
      required: true,
    },
    scene_index: {
      type: Number,
      required: true,
    },
    description: {
      type: String,
      trim: true,
      required: true,
    },
    death_screen: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const Scene = db.model("scenes", sceneSchema);

module.exports = {
  model: Scene,
};
