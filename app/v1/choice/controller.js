const { Choice, Scene, Story } = require("../../../models/index");
const { choice, common, story, scene } = require("../../../services/index");
const { response } = require("../../../utils/index");
const httpStatus = require("http-status");
const { head } = require("lodash");

const getNewName = (nameOutcome1Inventroty, nametrueOutcome2, statSet) => {
  const statSetArray = statSet;
  const useStatSet =
    nameOutcome1Inventroty && nameOutcome1Inventroty.trim() !== "";
  const shouldUseStatSet =
    useStatSet && statSetArray.includes(nametrueOutcome2);
  return shouldUseStatSet ? "statset_id" : "baseline_id";
};

function removeDuplicates(arr) {
  let stringArr = arr.reduce((acc, curr) => {
    const stringVer = JSON.stringify(curr);
    if (!acc.some((json) => json === stringVer)) {
      acc.push(stringVer);
    }
    return acc;
  }, []);
  return stringArr.map((json) => JSON.parse(json));
}

const addChoice = async (req, res) => {
  try {
    const content = req.body;
    const findStoryScene = await scene.countAllScene(content.story_id);
    const findScene = await common.getById(Scene.model, content.scene_id);
    const findStory = await common.getById(Story.model, content.story_id);
    if (!findScene) {
      return response.success(
        { msgCode: "SCENE_NOT_FOUND" },
        res,
        httpStatus.NOT_FOUND
      );
    }

    // check if choices are already added
    const findChoice = await choice.findChoice(content.scene_id);
    if (findChoice) {
      return response.success(
        { msgCode: "CHOICE_ALREADY_DEFINED" },
        res,
        httpStatus.FORBIDDEN
      );
    }
    const stat_set = findStory.stat_set.map((id) => id.toString());
    console.log("SIUU", stat_set);

    // remove choices that have no title or a title that is an empty string
    content.choices = content.choices.filter(
      (choice) => choice.title && choice.title.trim() !== ""
    );

    // loop through choices and perform the transformation
    content.choices.forEach((choice) => {
      if (
        findStoryScene - 1 === findScene.scene_index &&
        (choice.condition.variable.true_linked_scene_index === 0 ||
          choice.condition.variable.true_linked_scene_index === null)
      ) {
        choice.condition.variable.true_linked_scene_index = 1;
      }
      if (
        findStoryScene - 1 === findScene.scene_index &&
        (choice.condition.variable.false_linked_scene_index === 0 ||
          choice.condition.variable.false_linked_scene_index === null)
      ) {
        choice.condition.variable.false_linked_scene_index = 1;
      }

      // Perform the transformation for true_outcome
      if (choice.condition.variable.true_outcome) {
        choice.condition.variable.true_outcome = removeDuplicates(
          choice.condition.variable.true_outcome
            .map((outcome) => {
              const newName = getNewName(
                outcome.nameOutcome1Inventroty,
                outcome.nametrueOutcome2,
                stat_set
              );
              return {
                item_id: outcome.nameOutcome1Inventroty,
                operator: outcome.operatorOutcome1,
                value: outcome.valueOutcome1,
                [newName]: outcome.nametrueOutcome2,
              };
            })
            .filter((outcome) => Object.values(outcome).some(Boolean))
        );
      }

      // Perform the transformation for false_outcome
      if (choice.condition.variable.false_outcome) {
        choice.condition.variable.false_outcome = removeDuplicates(
          choice.condition.variable.false_outcome
            .map((outcome) => {
              const newName = getNewName(
                outcome.nameOutcome2Inventroty,
                outcome.nameOutcome2,
                stat_set
              );
              return {
                item_id: outcome.nameOutcome2Inventroty,
                operator: outcome.operatorOutcome2,
                value: outcome.valueOutcome2,
                [newName]: outcome.nameOutcome2,
              };
            })
            .filter((outcome) => Object.values(outcome).some(Boolean))
        );
      }
    });

    console.log(JSON.stringify(content));
    // add choice
    const data = await common.create(Choice.model, content);
    if (!data) {
      return response.error(
        { msgCode: "FAILED_TO_UPDATE" },
        res,
        httpStatus.FORBIDDEN
      );
    }

    return response.success(
      { msgCode: "CHOICE_DEFINED", data },
      res,
      httpStatus.ACCEPTED
    );
  } catch (error) {
    console.log("Error:", error);
    return response.error(
      { msgCode: "INTERNAL_SERVER_ERROR" },
      res,
      httpStatus.INTERNAL_SERVER_ERROR
    );
  }
};

const deleteChoice = async (req, res) => {
  try {
    const { scene_id } = req.params;
    //Delete choice
    const data = await choice.removeChoiceBySceneId(Choice.model, scene_id);
    if (!data) {
      return response.success(
        { msgCode: "CHOICE_NOT_FOUND" },
        res,
        httpStatus.FORBIDDEN
      );
    }
    return response.success(
      { msgCode: "CHOICE_DELETED", data: {} },
      res,
      httpStatus.ACCEPTED
    );
  } catch (error) {
    console.log(
      "🚀 ~ file: controller.js ~ line 15 ~ deleteChoice ~ error",
      error
    );
    return response.error(
      { msgCode: "INTERNAL_SERVER_ERROR" },
      res,
      httpStatus.INTERNAL_SERVER_ERROR
    );
  }
};

const updateChoice = async (req, res) => {
  try {
    const { scene_id } = req.params;
    const content = req.body;

    const findStoryScene = await scene.countAllScene(content.story_id);
    const findScene = await common.getById(Scene.model, scene_id);
    console.log(findScene);
    const findStory = await common.getById(Story.model, findScene.story_id);
    if (!findScene) {
      return response.success(
        { msgCode: "SCENE_NOT_FOUND" },
        res,
        httpStatus.NOT_FOUND
      );
    }

    // check if choices are already added
    const findChoice = await choice.findChoice(content.scene_id);
    if (findChoice) {
      return response.success(
        { msgCode: "CHOICE_ALREADY_DEFINED" },
        res,
        httpStatus.FORBIDDEN
      );
    }
    const stat_set = findStory.stat_set.map((id) => id.toString());
    console.log("SIUU", stat_set);

    // remove choices that have no title or a title that is an empty string
    content.choices = content.choices.filter(
      (choice) => choice.title && choice.title.trim() !== ""
    );

    // loop through choices and perform the transformation
    content.choices.forEach((choice) => {
      if (
        findStoryScene - 1 === findScene.scene_index &&
        (choice.condition.variable.true_linked_scene_index === 0 ||
          choice.condition.variable.true_linked_scene_index === null)
      ) {
        choice.condition.variable.true_linked_scene_index = 1;
      }
      if (
        findStoryScene - 1 === findScene.scene_index &&
        (choice.condition.variable.false_linked_scene_index === 0 ||
          choice.condition.variable.false_linked_scene_index === null)
      ) {
        choice.condition.variable.false_linked_scene_index = 1;
      }

      // Perform the transformation for true_outcome
      if (choice.condition.variable.true_outcome) {
        choice.condition.variable.true_outcome = removeDuplicates(
          choice.condition.variable.true_outcome
            .map((outcome) => {
              const newName = getNewName(
                outcome.nameOutcome1Inventroty,
                outcome.nametrueOutcome2,
                stat_set
              );
              return {
                item_id: outcome.nameOutcome1Inventroty,
                operator: outcome.operatorOutcome1,
                value: outcome.valueOutcome1,
                [newName]: outcome.nametrueOutcome2,
              };
            })
            .filter((outcome) => Object.values(outcome).some(Boolean))
        );
      }
      
      // Perform the transformation for false_outcome
      if (choice.condition.variable.false_outcome) {
        choice.condition.variable.false_outcome = removeDuplicates(
          choice.condition.variable.false_outcome
            .map((outcome) => {
              const newName = getNewName(
                outcome.nameOutcome2Inventroty,
                outcome.nameOutcome2,
                stat_set
              );
              return {
                item_id: outcome.nameOutcome2Inventroty,
                operator: outcome.operatorOutcome2,
                value: outcome.valueOutcome2,
                [newName]: outcome.nameOutcome2,
              };
            })
            .filter((outcome) => Object.values(outcome).some(Boolean))
        );
      }
    });
    console.log(JSON.stringify(content));
    //update choice
    const data = await choice.updateBySceneId(scene_id, content);
    if (!data) {
      return response.error(
        { msgCode: "CHOICE_NOT_FOUND" },
        res,
        httpStatus.FORBIDDEN
      );
    }
    return response.success(
      { msgCode: "CHOICE_UPDATED", data: data },
      res,
      httpStatus.ACCEPTED
    );
  } catch (error) {
    console.log(
      "🚀 ~ file: controller.js ~ line 15 ~ updateChoice ~ error",
      error
    );
    return response.error(
      { msgCode: "INTERNAL_SERVER_ERROR" },
      res,
      httpStatus.INTERNAL_SERVER_ERROR
    );
  }
};

const getVariables = async (req, res) => {
  try {
    const { id } = req.params;
    const data = await story.getStatSetOfStory(id);
    if (!data) {
      return response.success(
        { msgCode: "STORY_NOT_FOUND" },
        res,
        httpStatus.NOT_FOUND
      );
    }
    const value = head(data);
    const resultantData = {
      baseline: value.baseline,
      stat_set: value.stat_set,
    };
    return response.success(
      { msgCode: "FETCHED", data: resultantData },
      res,
      httpStatus.OK
    );
  } catch (error) {
    console.log(
      "🚀 ~ file: controller.js ~ line 15 ~ addChoice ~ error",
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
  addChoice,
  deleteChoice,
  updateChoice,
  getVariables,
};
