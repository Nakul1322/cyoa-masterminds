const Joi = require("joi");

// const outcome = {
//   baseline_id: Joi.string().allow("", null).optional(),
//   statset_id: Joi.string().allow("", null).optional(),
//   item_id: Joi.string().allow("", null).optional(),
//   operator: Joi.string().allow('', null).optional(),
//   value: Joi.number().allow('', null).optional().min(0).max(100),
// };
const outcome = Joi.array().items(
  {
    baseline_id: Joi.string().allow("", null).optional(),
    statset_id: Joi.string().allow("", null).optional(),
    item_id: Joi.string().allow("", null).optional(),
    operator: Joi.string().allow('', null).optional(),
    value: Joi.number().allow('', null).optional().min(0).max(100),
    linked_scene_index: Joi.number().optional().allow("", null),
    nametrueOutcome2: Joi.string().allow('', null).optional(),
    nameOutcome1Inventroty: Joi.string().allow('', null).optional(),
    operatorOutcome1: Joi.string().allow('', null).optional(),
    valueOutcome1: Joi.string().allow('', null).optional(),
    linkedScene2: Joi.string().allow('', null).optional(),
    nameOutcome2: Joi.string().allow('', null).optional(),
    nameOutcome2Inventroty: Joi.string().allow('', null).optional(),
    operatorOutcome2: Joi.string().allow('', null).optional(),
    valueOutcome2: Joi.string().allow('', null).optional(),
  }
);

// const variable = {
//   baseline_id: Joi.string().allow("", null).optional(),
//   statset_id: Joi.string().allow("", null).optional(),
//   item_id: Joi.string().allow("", null).optional(),
//   operator: Joi.string().allow('', null).optional(),
//   value: Joi.number().allow('', null).optional().min(0).max(100),
//   true_linked_scene_index: Joi.number().optional().allow("", null),
//   false_linked_scene_index: Joi.number().optional().allow("", null),
//   true_outcome: Joi.object().keys(outcome),
//   false_outcome: Joi.object().keys(outcome),
// };

const variable = {
  baseline_id: Joi.string().allow("", null).optional(),
  statset_id: Joi.string().allow("", null).optional(),
  item_id: Joi.string().allow("", null).optional(),
  operator: Joi.string().allow('', null).optional(),
  value: Joi.number().allow('', null).optional().min(0).max(100),
  true_outcome: outcome.optional(),
  false_outcome: outcome.optional(),
  true_linked_scene_index: Joi.number().allow(null).optional(), // add this line
  false_linked_scene_index: Joi.number().allow(null).optional(),
};

const condition = { variable: Joi.object().keys(variable) };

const choice = Joi.object().keys({
  title: Joi.string().trim().min(2).max(200).optional().allow("", null),
  condition: Joi.object().keys(condition),
});

const addChoice = Joi.object().keys({
  scene_id: Joi.string().required(),
  story_id: Joi.string().required(),
  choices: Joi.array().items(choice),
  
});

const updateChoice = Joi.object().keys({
  scene_id: Joi.string().optional(),
  story_id: Joi.string().optional(),
  choices: Joi.array().optional(),
});

const deleteChoice = Joi.object().keys({
  story_id: Joi.string().optional(),
});

const getVariables = Joi.object().keys({
  story_id: Joi.string().optional(),
});

module.exports = {
  addChoice,
  updateChoice,
  deleteChoice,
  getVariables,
};
