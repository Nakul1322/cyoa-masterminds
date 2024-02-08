const { User, Story, Userchoice, Userscore } = require("../../../models/index");
const { users, common, story, scene } = require("../../../services/index");
const { response, constants } = require("../../../utils/index");
const httpStatus = require("http-status");
const { Types } = require("mongoose");
const { head } = require('lodash');

const creatorAction = async (req, res) => {
  try {
    const { action, id } = req.params;
    let updates;
    if (Number(action) == 0) {
      updates = { status: action, device_info: null, deleteAt: Date.now() }
    }
    updates = { status: action, device_info: null };
    //update actions
    const data = await common.updateById(User.model, id, updates);
    if (!data) {
      response.success({ msgCode: "USER_NOT_FOUND" }, res, httpStatus.NOT_FOUND);
    }
    if (action == 0) {
      response.success({ msgCode: "USER_DELETED" }, res, httpStatus.ACCEPTED);
    }
    if (action == -1) {
      response.success({ msgCode: "USER_BLOCKED" }, res, httpStatus.ACCEPTED);
    }
    response.success({ msgCode: "USER_UNBLOCKED" }, res, httpStatus.ACCEPTED);
  } catch (error) {
    console.log(
      "🚀 ~ file: controller.js ~ line 15 ~ creatorAction ~ error",
      error
    );
    return response.error(
      { msgCode: "INTERNAL_SERVER_ERROR" },
      res,
      httpStatus.INTERNAL_SERVER_ERROR
    );
  }
};

const getCreator = async (req, res) => {
  try {
    const { id, page, size, sort, order, search } = req.query;
    const data = await users.findByUserType(id, Number(constants.user_type[0].CREATOR), page, size, sort, order, search)
    
    return response.success(
      {
        msgCode: "FETCHED",
        data: head(data),
      },
      res,
      httpStatus.OK
    );
  } catch (error) {
    return response.error(
      { msgCode: "INTERNAL_SERVER_ERROR" },
      res,
      httpStatus.INTERNAL_SERVER_ERROR
    );
  }
};

const rejectReason = async (req, res) => {
  try {
    const { story_id } = req.query;
    const findStory = await common.getById(Story.model, story_id);
    if (!findStory) {
      return response.success(
        { msgCode: "STORY_NOT_FOUND", data: {} },
        res,
        httpStatus.NOT_FOUND
      );
    }
    const result = {
      cover_title: findStory.cover_title,
      cover_image: findStory.cover_image,
      cover_description: findStory.cover_description,
      rejectReason: findStory.rejectReason,
    };
    response.success(
      { msgCode: "FETCHED", data: result },
      res,
      httpStatus.OK
    );
  } catch (error) {
    console.log(
      "🚀 ~ file: controller.js ~ line 15 ~ userScore ~ error",
      error
    );
    return response.error(
      { msgCode: "INTERNAL_SERVER_ERROR" },
      res,
      httpStatus.INTERNAL_SERVER_ERROR
    );
  }
};

const userBasedStory = async (req, res) => {
  try {
    const decode = req.data;
    //find story
    const findStory = await story.getStory(decode.story_id);
    if (!findStory) {
      return response.success(
        { msgCode: "STORY_NOT_FOUND", data: {} },
        res,
        httpStatus.NOT_FOUND
      );
    }
    //find scene
    const findScene = await scene.findAllScene(decode.story_id);
    if (!findScene) {
      return response.success(
        { msgCode: "SCENE_NOT_FOUND", data: {} },
        res,
        httpStatus.NOT_FOUND
      );
    }
    //desired output
    const result = {
      story: findStory,
      scene: findScene,
    };
    return response.success(
      { msgCode: "STORY_FETCHED", data: result },
      res,
      httpStatus.OK
    );
  } catch (error) {
    console.log("🚀 ~ file: controller.js ~ line 15 ~ getStory ~ error", error);
    return response.error(
      { msgCode: "INTERNAL_SERVER_ERROR" },
      res,
      httpStatus.INTERNAL_SERVER_ERROR
    );
  }
};

const userChoice = async (req, res) => {
  try {
    const { userChoices } = req.body;
    const decode = req.data;
    //find user
    const findUser = await common.getById(User.model, decode.user_id);
    if (!findUser) {
      return response.success(
        { msgCode: "USER_NOT_FOUND", data: {} },
        res,
        httpStatus.NOT_FOUND
      );
    }
    //find story
    const findStory = await common.getById(Story.model, decode.story_id);
    if (!findStory) {
      return response.success(
        { msgCode: "STORY_NOT_FOUND", data: {} },
        res,
        httpStatus.NOT_FOUND
      );
    }
    //create userChoice
    const createChoice = await common.create(Userchoice.model, {
      user_id: decode.user_id,
      story_id: decode.story_id,
      userChoices,
    });
    if (!createChoice) {
      response.error(
        { msgCode: "FAILED_TO_ADD", data: {} },
        res,
        httpStatus.FORBIDDEN
      );
    }
    response.success(
      { msgCode: "USER_CHOICE", data: {} },
      res,
      httpStatus.ACCEPTED
    );
  } catch (error) {
    console.log(
      "🚀 ~ file: controller.js ~ line 15 ~ userChoice ~ error",
      error
    );
    return response.error(
      { msgCode: "INTERNAL_SERVER_ERROR" },
      res,
      httpStatus.INTERNAL_SERVER_ERROR
    );
  }
};

const userScore = async (req, res) => {
  try {
    const data = req.body;
    const decode = req.data;
    const findUser = await common.getById(User.model, decode.user_id);
    if (!findUser) {
      return response.success(
        { msgCode: "USER_NOT_FOUND", data: {} },
        res,
        httpStatus.NOT_FOUND
      );
    }
    const findStory = await common.getById(Story.model, decode.story_id);
    if (!findStory) {
      return response.success(
        { msgCode: "STORY_NOT_FOUND", data: {} },
        res,
        httpStatus.NOT_FOUND
      );
    }
    const createScore = await common.create(Userscore.model, {
      user_id: decode.user_id,
      story_id: decode.story_id,
      baseline: data.baseline,
      statset: data.statset,
    });
    response.success(
      { msgCode: "USER_CHOICE", data: {} },
      res,
      httpStatus.ACCEPTED
    );
  } catch (error) {
    console.log(
      "🚀 ~ file: controller.js ~ line 15 ~ userScore ~ error",
      error
    );
    return response.error(
      { msgCode: "INTERNAL_SERVER_ERROR" },
      res,
      httpStatus.INTERNAL_SERVER_ERROR
    );
  }
};

module.exports = {
  creatorAction,
  getCreator,
  rejectReason,
  userBasedStory,
  userChoice,
  userScore,
};
