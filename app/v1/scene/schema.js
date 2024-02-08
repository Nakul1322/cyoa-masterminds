const Joi = require("joi");
const { customDescriptionValidator } = require("../../../utils/index");

const addScene = Joi.object().keys({
  scene_name: Joi.string().trim().min(2).max(100).required(),
  scene_index: Joi.number().required(),
  description: Joi.string()
    .trim()
    .custom(customDescriptionValidator)
    .required(),
  story_id: Joi.string().required(),
  death_screen: Joi.boolean().optional(),
  old_scene: Joi.string().allow("").optional(),
});

const updateScene = Joi.object().keys({
  scene_name: Joi.string().trim().min(2).max(100).optional(),
  scene_index: Joi.number().optional(),
  description: Joi.string()
    .trim()
    .custom(customDescriptionValidator)
    .optional(),
  story_id: Joi.string().optional(),
  death_screen: Joi.boolean().optional(),
  old_scene: Joi.string().allow("").optional(),
});

const deleteScene = Joi.object().keys({
  scene_id: Joi.string().optional(),
});

const redirection = Joi.object().keys({
  story_id: Joi.string().optional(),
});

const getTree = Joi.object().keys({
  story_id: Joi.string().optional(),
});

module.exports = {
  addScene,
  updateScene,
  deleteScene,
  redirection,
  getTree,
};
