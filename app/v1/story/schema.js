const Joi = require("joi");
const path = require('path');
const { response } = require('../../../utils/index');
const httpStatus = require('http-status');

const baseline = Joi.object().keys({
  title: Joi.string().trim().min(1).max(3).optional(),
  value: Joi.number().optional().min(0).max(100),
  affectThreshold: Joi.boolean().optional()
});

const item = Joi.object().keys({
  name: Joi.string().trim().min(1).max(25).optional(),
  value: Joi.number().optional().min(0).max(100),
  hidden: Joi.boolean().optional(),
});

const stat_set = Joi.object().keys({
  title: Joi.string().trim().min(1).max(5).optional(),
  items: Joi.array().items(item).optional(),
  itemMaxCount: Joi.number().optional(),
});

const addStory = Joi.object().keys({
  cover_image: Joi.string().required(),
  cover_title: Joi.string().trim().min(1).max(100).required(),
  cover_description: Joi.string().trim().min(1).max(500).required(),
  baseline: Joi.array().items(baseline).required(),
  stat_set: Joi.array().items(stat_set).required(),
  threshold: Joi.number().required(),
});

const updateStory = Joi.object().keys({
  story_id: Joi.string().optional(),
  cover_image: Joi.string().optional(),
  cover_title: Joi.string().trim().min(1).max(100).optional(),
  cover_description: Joi.string().trim().min(1).max(500).optional(),
  sceneCount: Joi.number().optional(),
  baseline: Joi.array().optional(),
  stat_set: Joi.array().optional(),
  threshold: Joi.number().optional(),
});

const deleteStory = Joi.object().keys({
  story_id: Joi.string().optional(),
});

const approval = Joi.object().keys({
  story_id: Joi.string().optional(),
});

const acceptRejectStory = Joi.object().keys({
  story_id: Joi.string().optional(),
  action: Joi.number().required(),
  isPaid: Joi.boolean().optional(),
  freeScene: Joi.number().optional(),
  amount: Joi.number().optional(),
  rejectReason: Joi.string().min(10).max(260).optional(),
});

const activeStory = Joi.object().keys({
  creator_id: Joi.string().optional(),
  status: Joi.number().optional(),
  page: Joi.number().optional(),
  size: Joi.number().optional(),
  search: Joi.string().optional(),
});

const getStory = Joi.object().keys({
  id: Joi.string().optional(),
  creator_id: Joi.string().optional(),
});

const getScene = Joi.object().keys({
  id: Joi.string().optional(),
  number: Joi.number().optional(),
});

const addImage = (req, res, next) => {
  if (!req.files) {
    return response.error(
      { msgCode: "VALIDATION_ERROR", data: "cover_image is required" },
      res,
      httpStatus.BAD_REQUEST
    );
  }
  const image = req.files.cover_image;

  const array_of_allowed_files = ['png', 'jpeg', 'jpg'];
  const array_of_allowed_file_types = ['image/png', 'image/jpeg', 'image/jpg'];
  // Allowed file size in mb
  const allowed_file_size = 5000000;
  // Get the extension of the uploaded file
  const file_extension = path.extname(image.name).slice(1)

  // Check if the uploaded file is allowed
  if (!array_of_allowed_files.includes(file_extension) || !array_of_allowed_file_types.includes(image.mimetype)) {
    //throw Error('Invalid file');
    return response.error(
      { msgCode: "NOT_VALID_IMAGE" },
      res,
      httpStatus.BAD_REQUEST
    );
  }

  if ((image.size) > allowed_file_size) {
    return response.error(
      { msgCode: "IMAGE_IS_LARGE" },
      res,
      httpStatus.BAD_REQUEST
    );
  }
  return next();
}

module.exports = {
  updateStory,
  addStory,
  deleteStory,
  approval,
  acceptRejectStory,
  activeStory,
  getStory,
  getScene,
  addImage
};
