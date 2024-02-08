const { Scene, Story, Choice } = require("../../../models/index");
const { scene, common } = require("../../../services/index");
const { response } = require("../../../utils/index");
const httpStatus = require("http-status");
const { Types } = require("mongoose");

const addScene = async (req, res) => {
  try {
    let data;
    const content = req.body;

    if (content.death_screen && content.scene_index === -1) {
      const updateDeathScreenStatus = await Scene.model.updateMany(
        { story_id: Types.ObjectId(content.story_id) }, // Replace with the actual storyId
        { $set: { death_screen: false } }
      );
      //Update death_screen status for all the scenes of a story
      if (content.old_scene !== null && content.old_scene.trim() !== "") {
        // Remove scene
        const removedScene = await Scene.model.findByIdAndRemove(
          content.old_scene
        );
      }
    }
    //add Scene
    data = await common.create(Scene.model, content);

    if (!data) {
      return response.error(
        { msgCode: "FAILED_TO_ADD" },
        res,
        httpStatus.FORBIDDEN
      );
    }
    return response.success(
      { msgCode: "SCENE_ADDED", data },
      res,
      httpStatus.ACCEPTED
    );
  } catch (error) {
    console.log("🚀 ~ file: controller.js ~ line 15 ~ addScene ~ error", error);
    return response.error(
      { msgCode: "INTERNAL_SERVER_ERROR" },
      res,
      httpStatus.INTERNAL_SERVER_ERROR
    );
  }
};

const deleteScene = async (req, res, next) => {
  try {
    const { story_id, scene_index } = req.params;
    const index = Number(scene_index);
    const findChoice = await common.getByCondition(Choice.model, {
      story_id: Types.ObjectId(story_id),
    });

    if (findChoice.length > 0) {
      const choice = await scene.findSceneLinked(story_id, index);
      if (choice.length > 0) {
        let scenes = [];
        choice.forEach((ele) => {
          scenes.push(ele.scene);
        });
        return response.success(
          { msgCode: "UNLINK_CHOICE", data: scenes },
          res,
          httpStatus.OK
        );
      }

      //delete scene
      const data = await scene.removeByTwoCondition(
        Scene.model,
        { story_id: story_id },
        { scene_index: scene_index }
      );
      if (!data) {
        return response.success(
          { msgCode: "SCENE_NOT_FOUND" },
          res,
          httpStatus.NOT_FOUND
        );
      }
      //delete choices
      const choiceDelete = await scene.removeByTwoCondition(
        Choice.model,
        { story_id: story_id },
        { scene_id: data.scene_id }
      );

      return response.success(
        { msgCode: "DELETED", data: {} },
        res,
        httpStatus.ACCEPTED
      );
    }
    //middleware
    req.deleteData = {
      story_id,
      index,
    };
    return next();
  } catch (error) {
    console.log(
      "🚀 ~ file: controller.js ~ line 15 ~ deleteScene ~ error",
      error
    );
    return response.error(
      { msgCode: "INTERNAL_SERVER_ERROR" },
      res,
      httpStatus.INTERNAL_SERVER_ERROR
    );
  }
};

const deleteAndUpdateIndex = async (req, res) => {
  try {
    const { story_id, scene_index } = req.params;
    const index = Number(scene_index);
    if (index != -1) {
      const deleteScene = await scene.removeByTwoCondition(
        Scene.model,
        { story_id: story_id },
        { scene_index: index }
      );
      if (!deleteScene) {
        return response.success(
          { msgCode: "SCENE_NOT_FOUND" },
          res,
          httpStatus.NOT_FOUND
        );
      }
      //finding data greater then index given then update index
      const data = await Scene.model.update(
        { $and: [{ story_id: story_id }, { scene_index: { $gt: index } }] },
        { $inc: { scene_index: -1 } }
      );
      return response.success(
        { msgCode: "DELETED", data: {} },
        res,
        httpStatus.CREATED
      );
    }

    //delete scene of given index
    const deleteScene = await scene.removeByTwoCondition(
      Scene.model,
      { story_id: story_id },
      { scene_index: index }
    );
    if (!deleteScene) {
      return response.success(
        { msgCode: "SCENE_NOT_FOUND" },
        res,
        httpStatus.NOT_FOUND
      );
    }

    return response.success(
      { msgCode: "DELETED", data: {} },
      res,
      httpStatus.CREATED
    );
  } catch (error) {
    return response.error(
      { msgCode: "INTERNAL_SERVER_ERROR" },
      res,
      httpStatus.INTERNAL_SERVER_ERROR
    );
  }
};

const updateScene = async (req, res) => {
  try {
    const { scene_id } = req.params;
    const updates = req.body;

    //update scene
    const data = await common.updateById(Scene.model, scene_id, updates);
    if (!data) {
      return response.success(
        { msgCode: "SCENE_NOT_FOUND" },
        res,
        httpStatus.NOT_FOUND
      );
    }
    return response.success(
      { msgCode: "UPDATED", data: {} },
      res,
      httpStatus.ACCEPTED
    );
  } catch (error) {
    console.log(
      "🚀 ~ file: controller.js ~ line 15 ~ updateScene ~ error",
      error
    );
    return response.error(
      { msgCode: "INTERNAL_SERVER_ERROR" },
      res,
      httpStatus.INTERNAL_SERVER_ERROR
    );
  }
};

const getScene = async (req, res) => {
  try {
    let data;
    const { id, number } = req.params;
    if (number.match("0")) {
      data = await scene.findAllScene(id);
    } else {
      data = await scene.getSceneByIndex(id, number);
    }
    //get Scene using id and Index
    return response.success(
      { msgCode: "SCENE_FETCHED", data },
      res,
      httpStatus.OK
    );
  } catch (error) {
    console.log("🚀 ~ file: controller.js ~ line 15 ~ getScene ~ error", error);
    return response.error(
      { msgCode: "INTERNAL_SERVER_ERROR" },
      res,
      httpStatus.INTERNAL_SERVER_ERROR
    );
  }
};

const redirectionScreen = async (req, res) => {
  try {
    const { story_id } = req.query;
    const sceneCount = await scene.findAllScene(story_id);
    if (!sceneCount) {
      return response.success(
        { msgCode: "SCENE_NOT_FOUND", data },
        res,
        httpStatus.NOT_FOUND
      );
    }
    const data = [];
    //loop to get indexes
    sceneCount.forEach((ele) => {
      if (ele.scene_index != -1) {
        sceneIndex = ele.scene_index;
        data.push(sceneIndex);
      }
    });

    // sort the array in ascending order
    data.sort((a, b) => a - b);

    // After the sceneCount loop, add 'Death Screen' as a separate element
    data.push("Death Scene");

    return response.success(
      { msgCode: "SCENE_FETCHED", data: data },
      res,
      httpStatus.OK
    );
  } catch (error) {
    console.log("🚀 ~ file: controller.js ~ line 15 ~ getScene ~ error", error);
    return response.error(
      { msgCode: "INTERNAL_SERVER_ERROR" },
      res,
      httpStatus.INTERNAL_SERVER_ERROR
    );
  }
};

const getSceneTree = async (req, res) => {
  try {
    const { storyId } = req.params;
    const sceneTree = await scene.sceneTree(storyId);

    //story name
    const storyName = await Story.model.findOne({
      _id: Types.ObjectId(storyId),
    });

    return response.success(
      {
        msgCode: "SCENE_FETCHED",
        data: { name: storyName.cover_title, children: sceneTree },
      },
      res,
      httpStatus.OK
    );
  } catch (error) {
    console.log("🚀 ~ file: controller.js ~ line 15 ~ getScene ~ error", error);
    return response.error(
      { msgCode: "INTERNAL_SERVER_ERROR" },
      res,
      httpStatus.INTERNAL_SERVER_ERROR
    );
  }
};

module.exports = {
  addScene,
  deleteScene,
  updateScene,
  getScene,
  redirectionScreen,
  getSceneTree,
  deleteAndUpdateIndex,
};
