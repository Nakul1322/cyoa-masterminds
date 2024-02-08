const { Schema } = require("mongoose");
const mongoose = require("mongoose");

const db = require("../config/database").getUserDB();

const castObjectId = mongoose.ObjectId.cast();
mongoose.ObjectId.cast((v) => (v === "" ? v : castObjectId(v)));

const choiceSchema = new Schema(
  {
    scene_id: {
      type: Schema.Types.ObjectId,
      ref: "scenes",
      required: true,
    },
    story_id: {
      type: Schema.Types.ObjectId,
      ref: "stories",
    },
    choices: [
      {
        title: { type: String },
        condition: {
          variable: {
            baseline_id: {
              type: Schema.Types.ObjectId,
              ref: "stories",
              default: null,
            },
            statset_id: {
              type: Schema.Types.ObjectId,
              ref: "statsets",
              default: null,
            },
            item_id: {
              type: Schema.Types.ObjectId,
              ref: "statsets",
              default: null,
            },
            operator: {
              type: String,
            },
            value: {
              type: Number,
            },
            true_linked_scene_index: {
              type: Number,
            },
            false_linked_scene_index: {
              type: Number,
            },
            true_outcome: [
              {
                baseline_id: {
                  type: Schema.Types.ObjectId,
                  ref: "stories",
                  default: null,
                },
                statset_id: {
                  type: Schema.Types.ObjectId,
                  ref: "statsets",
                  default: null,
                },
                item_id: {
                  type: Schema.Types.ObjectId,
                  ref: "statsets",
                  default: null,
                },
                operator: {
                  type: String,
                },
                value: {
                  type: Number,
                },
              },
            ],
            false_outcome: [
              {
                baseline_id: {
                  type: Schema.Types.ObjectId,
                  ref: "baselines",
                  default: null,
                },
                statset_id: {
                  type: Schema.Types.ObjectId,
                  ref: "statsets",
                  default: null,
                },
                item_id: {
                  type: Schema.Types.ObjectId,
                  ref: "statsets",
                  default: null,
                },
                operator: {
                  type: String,
                },
                value: {
                  type: Number,
                },
              },
            ],
          },
        },
      },
    ],
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const Choice = db.model("choices", choiceSchema);

module.exports = {
  model: Choice,
};
