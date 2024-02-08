const { Schema } = require("mongoose");
const { constants } = require('../utils/index')

const db = require("../config/database").getUserDB();

const storySchema = new Schema(
  {
    creator_id: {
      type: Schema.Types.ObjectId,
      ref: "users",
    },
    status: {
      type: Number,
      enum: constants.story_status,
      default: 0,
    },
    cover_title: {
      type: String,
    },
    cover_description: {
      type: String,
    },
    cover_image: {
      type: String,
      unique: true,
    },
    sceneCount: {
      type: Number,
    },
    threshold: {
      type: Number,
    },
    baseline: [
      {
        title: {
          type: String,
        },
        value: {
          type: Number,
          default: 0,
        },
        affectThreshold: {
          type: Boolean,
          default: true
        }
      },
    ],
    stat_set: [
      {
        type: Schema.Types.ObjectId,
        ref: "statsets",
        default: null,
      },
    ],
    statSetMaxValue: {
      type: Number,
    },
    isPaid: {
      type: Boolean,
      default: true,
    },
    freeScene: {
      type: Number,
    },
    amount: {
      type: Number,
    },
    requested_date: {
      type: Date,
    },
    approved_date: {
      type: Date,
    },
    rejection_date: {
      type: Date,
    },
    rejectReason: {
      type: String
    }
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const Story = db.model("stories", storySchema);

module.exports = {
  model: Story,
};
