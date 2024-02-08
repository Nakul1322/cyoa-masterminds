const { Scene } = require("../models/index");
const { Types } = require("mongoose");
const {
  choiceAggregation,
  choiceAggre,
  storyAggregation,
  creatorNameAggregation,
} = require("./../utils/index");

const getSceneByIndex = async (storyId, index) => {
  try {
    const choiceLookup = choiceAggregation();
    const data = await Scene.model.aggregate([
      { $match: { story_id: Types.ObjectId(storyId) } },
      { $match: { scene_index: Number(index) } },
      { $lookup: choiceLookup },
    ]);
    return data;
  } catch (error) {
    return false;
  }
};

const countAllScene = async (id) => {
  try {
    const data = await Scene.model
      .find({ story_id: Types.ObjectId(id) })
      .count()
      .exec();
    return data;
  } catch (error) {
    return false;
  }
};

const findAllScene = async (id) => {
  try {
    const choiceLookup = choiceAggregation();
    const storyLookup = storyAggregation();
    const creatorNameLookup = creatorNameAggregation();
    const data = await Scene.model.aggregate([
      { $lookup: choiceLookup },
      { $lookup: storyLookup },
      { $unwind: { path: "$story_info", preserveNullAndEmptyArrays: true } },
      { $lookup: creatorNameLookup },
      { $unwind: { path: "$user_info", preserveNullAndEmptyArrays: true } },
      { $match: { story_id: Types.ObjectId(id) } },
      {
        $project: {
          _id: 1,
          scene_name: 1,
          story_id: 1,
          scene_index: 1,
          creator_name: "$user_info.name",
          description: 1,
          death_screen: 1,
          createdAt: 1,
          updatedAt: 1,
          choice: {
            $map: {
              input: "$choice",
              as: "c",
              in: {
                _id: "$$c._id",
                scene_id: "$$c.scene_id",
                story_id: "$$c.story_id",
                choices: {
                  $map: {
                    input: "$$c.choices",
                    as: "choice",
                    in: {
                      title: "$$choice.title",
                      condition: "$$choice.condition",
                      _id: "$$choice._id",
                    },
                  },
                },
                createdAt: "$$c.createdAt",
                updatedAt: "$$c.updatedAt",
              },
            },
          },
        },
      },
    ]);
    // Sort data based on scene_index. Put death_screen (represented by -1) at the end.
    data.sort((a, b) => {
      if (a.scene_index === -1) return 1;
      if (b.scene_index === -1) return -1;
      return a.scene_index - b.scene_index;
    });
    return data;
  } catch (error) {
    return false;
  }
};

const sceneTree = async (id) => {
  try {
    const choiceLookup = choiceAggre();
    const data = await Scene.model.aggregate([
      { $match: { story_id: Types.ObjectId(id) } },
      {
        $project: {
          _id: 1,
          scene_index: { $concat: ["scene ", { $toString: "$scene_index" }] },
        },
      },
      { $lookup: choiceLookup },
      { $unwind: "$choice" },
      { $unwind: "$choice.children" },
      {
        $group: {
          _id: "$_id",
          name: { $first: "$scene_index" },
          children: { $push: "$choice.children" },
        },
      },
      {
        $unset: ["_id"],
      },
      { $sort: { name: 1 } },
    ]);
    // Remove objects with name as null from children arrays
    data.forEach((item) => {
      item.children = item.children.filter((child) => child.name !== null);
    });
    return data;
  } catch (error) {
    return false;
  }
};

const removeByTwoCondition = async (Model, condition1, condition2) => {
  try {
    const data = await Model.findOneAndDelete({
      $and: [condition1, condition2],
    });
    return data;
  } catch (error) {
    return false;
  }
};

const findSceneLinked = async (story_id, index) => {
  try {
    const data = await Scene.model.aggregate([
      { $match: { story_id: Types.ObjectId(story_id) } },
      {
        $lookup: {
          from: "choices",
          let: { sceneId: "$_id" },
          pipeline: [
            { $match: { $expr: { $eq: ["$scene_id", "$$sceneId"] } } },
            { $unwind: "$choices" },
            {
              $match: {
                $or: [
                  // { 'choices.condition.variable.true_outcome.linked_scene_index': index },
                  // { 'choices.condition.variable.false_outcome.linked_scene_index': index }
                  {
                    "choices.condition.variable.true_linked_scene_index": {
                      $in: [index],
                    },
                  },
                  {
                    "choices.condition.variable.false_linked_scene_index": {
                      $in: [index],
                    },
                  },
                ],
              },
            },
          ],
          as: "choice",
        },
      },
      { $unwind: "$choice" },
      {
        $group: {
          _id: "$_id",
          scene: {
            $first: { $concat: ["Scene ", { $toString: "$scene_index" }] },
          },
        },
      },
      {
        $sort: {
          scene: 1,
        },
      },
      { $unset: ["_id"] },
    ]);
    return data;
  } catch (err) {
    return false;
  }
};

module.exports = {
  getSceneByIndex,
  findAllScene,
  countAllScene,
  sceneTree,
  removeByTwoCondition,
  findSceneLinked,
};
