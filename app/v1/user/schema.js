const Joi = require("joi");

const userChoice = Joi.object().keys({
  choices: Joi.array().required(),
});

const userScore = Joi.object().keys({
  baseline: Joi.array(),
  statset: Joi.array(),
});

const creatorAction = Joi.object().keys({
  action: Joi.number().optional(),
  creator_id: Joi.string().optional(),
});

const getCreator = Joi.object().keys({
  creator_id: Joi.string().optional(),
});

const rejectReason = Joi.object().keys({
  story_id: Joi.string().optional(),
});

module.exports = {
  userChoice,
  userScore,
  creatorAction,
  getCreator,
  rejectReason,
};
