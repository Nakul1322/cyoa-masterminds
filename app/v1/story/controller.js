const { story, common, scene } = require("../../../services/index");
const { Story, Statset, Scene, Choice } = require("../../../models/index");
const { response, imageUpload } = require("../../../utils/index");
const { head } = require("lodash");
const httpStatus = require("http-status");

const getActiveStory = async (req, res) => {
  try {
    const { page, size, sort, order, search, status, creator_id } = req.query;

    const data = await story.findStoryByStatus(
      creator_id,
      status,
      page,
      size,
      order,
      sort,
      search
    );

    if (!data) {
      return response.success(
        { msgCode: "STORY_NOT_FOUND" },
        res,
        httpStatus.NOT_FOUND
      );
    }
    const result = head(data);
    return response.success(
      {
        msgCode: "STORY_FETCHED",
        data: result,
      },
      res,
      httpStatus.OK
    );
  } catch (error) {
    console.log(
      "🚀 ~ file: controller.js ~ line 15 ~ getActiveStory ~ error",
      error
    );
    return response.error(
      { msgCode: "INTERNAL_SERVER_ERROR" },
      res,
      httpStatus.INTERNAL_SERVER_ERROR
    );
  }
};

const getStory = async (req, res) => {
  try {
    let data;
    const { id } = req.params;
    const { creator_id } = req.query;
    //check for creator based story
    if (creator_id) {
      data = await story.findStoryOfCreator(id, creator_id);
      if (!data) {
        return response.success(
          { msgCode: "NOT_CREATOR_STORY", data: {} },
          res,
          httpStatus.NOT_FOUND
        );
      }
    }
    //story by storyId
    data = await story.getStatSetOfStory(id);
    return response.success(
      { msgCode: "STORY_FETCHED", data },
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

const uploadImage = async (req, res) => {
  try {
    const { cover_image } = req.files;
    const image = await imageUpload(cover_image);

    if (!image) {
      response.error({ msgCode: "IMAGE_NOT_ADDED" }, res, httpStatus.FORBIDDEN);
    }
    response.success(
      { msgCode: "IMAGE_ADDED", data: image },
      res,
      httpStatus.ACCEPTED
    );
  } catch (error) {
    console.log("🚀 ~ file: controller.js ~ line 15 ~ addStory ~ error", error);
    return response.error(
      { msgCode: "INTERNAL_SERVER_ERROR" },
      res,
      httpStatus.INTERNAL_SERVER_ERROR
    );
  }
};

const addStory = async (req, res) => {
  try {
    const {
      cover_title,
      cover_image,
      cover_description,
      threshold,
      baseline,
      stat_set,
    } = req.body;

    const content = {
      creator_id: req.data.user_id,
      cover_title,
      cover_description,
      cover_image,
      threshold,
      baseline,
    };

    // Convert threshold value to a number
    const parsedThreshold = parseFloat(threshold);

    // Extract the 'value' from each baseline object and find the minimum
    const baselineValues = baseline.map((item) => parseFloat(item.value));
    const minBaselineValue = Math.min(...baselineValues);

    if (isNaN(parsedThreshold) || isNaN(minBaselineValue)) {
      return response.error(
        { msgCode: "INVALID_INPUT" },
        res,
        httpStatus.BAD_REQUEST
      );
    }

    // Check if threshold is greater than or equal to the minimum baseline value
    if (parsedThreshold >= minBaselineValue) {
      return response.error(
        { msgCode: "THRESHOLD_TOO_HIGH" },
        res,
        httpStatus.BAD_REQUEST
      );
    }

    //create story cover
    const createStory = await common.create(Story.model, content);
    //insert statset
    const saveStatSet = await common.insertManyData(Statset.model, stat_set);
    //push ids of statset into story model
    saveStatSet.map(async (id) => {
      return await common.push(
        Story.model,
        { _id: createStory._id },
        { stat_set: id._id }
      );
    });

    //update story_id in statsets
    saveStatSet.map(async (id) => {
      return await common.updateById(Statset.model, id._id, {
        story_id: createStory._id,
      });
    });

    if (!createStory) {
      response.error({ msgCode: "FAILED_ADD" }, res, httpStatus.FORBIDDEN);
    }
    response.success(
      { msgCode: "STORY_ADDED", data: createStory },
      res,
      httpStatus.ACCEPTED
    );
  } catch (error) {
    console.log("🚀 ~ file: controller.js ~ line 15 ~ addStory ~ error", error);
    return response.error(
      { msgCode: "INTERNAL_SERVER_ERROR" },
      res,
      httpStatus.INTERNAL_SERVER_ERROR
    );
  }
};

const deleteStory = async (req, res) => {
  try {
    const { story_id } = req.params;
    //delete story
    const sceneDelete = await common.deleteByField(Scene.model, {
      story_id: story_id,
    });

    const choiceDelete = await common.deleteByField(Choice.model, {
      story_id: story_id,
    });

    const statsetDelete = await common.deleteByField(Statset.model, {
      story_id: story_id,
    });

    const storyDelete = await common.removeById(Story.model, story_id);
    if (!storyDelete) {
      return response.error(
        { msgCode: "STORY_NOT_FOUND" },
        res,
        httpStatus.NOT_FOUND
      );
    }
    return response.success(
      { msgCode: "DELETED", data: {} },
      res,
      httpStatus.ACCEPTED
    );
  } catch (error) {
    console.log(
      "🚀 ~ file: controller.js ~ line 15 ~ deleteStory ~ error",
      error
    );
    return response.error(
      { msgCode: "INTERNAL_SERVER_ERROR" },
      res,
      httpStatus.INTERNAL_SERVER_ERROR
    );
  }
};

const updateStory = async (req, res) => {
  try {
    const { story_id } = req.params;
    const { cover_title, cover_image, cover_description, baseline, stat_set } =
      req.body;
    let data;
    const updateBaseline = baseline.map(async (value) => {
      if (value._id) {
        const update = await story.updateBaseline(story_id, value);
      } else {
        const update = await common.push(
          Story.model,
          { _id: story_id },
          { baseline: value }
        );
      }
    });
    await Promise.all(updateBaseline);
    // if (stat_set) {
    for (const value of stat_set) {
      if (value._id) {
        let stat_set = value._id;
        const update = await common.updateById(Statset.model, value._id, {
          title: value.title,
        });
        for (const val of value.items) {
          if (val._id) {
            const update = await story.updateItems(stat_set, val);
          } else {
            const update = await common.push(
              Statset.model,
              { _id: value._id },
              { items: val }
            );
          }
        }
      } else {
        //insert statsetvalue
        const createStat = await common.create(Statset.model, value);
        //push ids of statset into story model
        await common.push(
          Story.model,
          { _id: story_id },
          { stat_set: createStat._id }
        );
        //update story_id in statsets
        const update = await common.updateById(Statset.model, createStat._id, {
          story_id: story_id,
        });
      }
    }

    data = await common.updateById(Story.model, story_id, {
      cover_title,
      cover_image,
      cover_description,
      baseline,
    });

    if (!data) {
      return response.error(
        { msgCode: "STORY_NOT_FOUND" },
        res,
        httpStatus.NOT_FOUND
      );
    }
    return response.success(
      { msgCode: "UPDATED", data },
      res,
      httpStatus.ACCEPTED
    );
  } catch (error) {
    console.log(
      "🚀 ~ file: controller.js ~ line 15 ~ updateStory ~ error",
      error
    );
    return response.error(
      { msgCode: "INTERNAL_SERVER_ERROR" },
      res,
      httpStatus.INTERNAL_SERVER_ERROR
    );
  }
};

const sendStoryForApproval = async (req, res) => {
  try {
    const { story_id } = req.query;
    const sceneCount = await scene.countAllScene(story_id);
    const updates = {
      requested_date: Date.now(),
      status: 1,
      sceneCount,
    };
    const updateInfo = await common.updateById(Story.model, story_id, updates);
    if (!updateInfo) {
      return response.success(
        { msgCode: "STORY_NOT_FOUND" },
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
      "🚀 ~ file: controller.js ~ line 15 ~ sendStoryForApproval ~ error",
      error
    );
    return response.error(
      { msgCode: "INTERNAL_SERVER_ERROR" },
      res,
      httpStatus.INTERNAL_SERVER_ERROR
    );
  }
};

const approveRejectStory = async (req, res) => {
  try {
    let updates;
    const { story_id } = req.query;
    const { action, isPaid, freeScene, amount, rejectReason } = req.body;
    if (Number(action) != 2) {
      updates = {
        status: action,
        rejection_date: Date.now(),
        rejectReason: rejectReason,
      };
    } else {
      updates = {
        status: action,
        isPaid,
        freeScene,
        amount,
        approved_date: Date.now(),
        rejectReason: null,
      };
    }
    //update the action approval or rejection
    const updateInfo = await common.updateById(Story.model, story_id, updates);
    if (!updateInfo) {
      return response.success(
        { msgCode: "STORY_NOT_FOUND" },
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
      "🚀 ~ file: controller.js ~ line 15 ~ approveRejectStory ~ error",
      error
    );
    return response.error(
      { msgCode: "INTERNAL_SERVER_ERROR" },
      res,
      httpStatus.INTERNAL_SERVER_ERROR
    );
  }
};

const deleteStatItem = async (req, res) => {
  try {
    const { statSetId, itemId } = req.query;
    const findStatSet = await common.getById(Statset.model, statSetId);
    if (!findStatSet) {
      return response.success(
        { msgCode: "NOT_FOUND" },
        res,
        httpStatus.NOT_FOUND
      );
    }
    const findStory = await common.getById(Story.model, findStatSet.story_id);
    if (
      Number(findStory.stat_set.length) === 1 &&
      Number(findStatSet.items.length) === 1
    ) {
      return response.success(
        { msgCode: "STATSET_REQUIRE" },
        res,
        httpStatus.FORBIDDEN
      );
    }
    const deleteItem = await common.pullObject(
      Statset.model,
      { _id: statSetId },
      { items: { _id: itemId } }
    );
    if (!deleteItem) {
      return response.success(
        { msgCode: "STORY_NOT_FOUND" },
        res,
        httpStatus.NOT_FOUND
      );
    }
    if (deleteItem.items.length === 0) {
      const deleteStatSet = await common.removeById(Statset.model, statSetId);
      if (!deleteStatSet) {
        return response.success(
          { msgCode: "STORY_NOT_FOUND" },
          res,
          httpStatus.NOT_FOUND
        );
      }
      const pullStatSet = await common.pullObject(
        Story.model,
        { _id: deleteItem.story_id },
        { stat_set: statSetId }
      );
      if (!pullStatSet) {
        return response.success(
          { msgCode: "API_ERROR" },
          res,
          httpStatus.FORBIDDEN
        );
      }
    }
    return response.success(
      { msgCode: "UPDATED", data: {} },
      res,
      httpStatus.ACCEPTED
    );
  } catch (error) {
    console.log(
      "🚀 ~ file: controller.js ~ line 15 ~ approveRejectStory ~ error",
      error
    );
    return response.error(
      { msgCode: "INTERNAL_SERVER_ERROR" },
      res,
      httpStatus.INTERNAL_SERVER_ERROR
    );
  }
};

const uniqueTitle = async (req, res, next) => {
  try {
    const { cover_title } = req.body;
    const findTitle = await common.findObject(Story.model, { cover_title });
    if (findTitle) {
      return response.error(
        { msgCode: "UNIQUE_TITLE" },
        res,
        httpStatus.NOT_ACCEPTABLE
      );
    }
    next();
  } catch (error) {
    console.log(
      "🚀 ~ file: controller.js ~ line 15 ~ approveRejectStory ~ error",
      error
    );
    return response.error(
      { msgCode: "INTERNAL_SERVER_ERROR" },
      res,
      httpStatus.INTERNAL_SERVER_ERROR
    );
  }
};

const uniqueDescription = async (req, res, next) => {
  try {
    const { cover_description } = req.body;
    const findTitle = await common.findObject(Story.model, {
      cover_description,
    });
    if (findTitle) {
      return response.error(
        { msgCode: "UNIQUE_DESCRIPTION" },
        res,
        httpStatus.NOT_ACCEPTABLE
      );
    }
    next();
  } catch (error) {
    console.log(
      "🚀 ~ file: controller.js ~ line 15 ~ approveRejectStory ~ error",
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
  addStory,
  deleteStory,
  updateStory,
  getActiveStory,
  getStory,
  sendStoryForApproval,
  approveRejectStory,
  uploadImage,
  deleteStatItem,
  uniqueTitle,
  uniqueDescription,
};
