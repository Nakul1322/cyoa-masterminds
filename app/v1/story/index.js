const { Router } = require("express");
const storyController = require("./controller");
const sceneController = require("../scene/controller");
const { validate, isAdminCreator, isAdmin } = require("../../../middlewares/index");
const schema = require("./schema");

const router = Router({ mergeParams: true });

router.post("/cover/image", isAdminCreator, schema.addImage, storyController.uploadImage);

router.post("/cover/add", isAdminCreator, validate(schema.addStory), storyController.uniqueTitle, storyController.uniqueDescription, storyController.addStory);

router.delete(
  "/delete/:story_id",
  isAdminCreator,
  validate(schema.deleteStory),
  storyController.deleteStory
);

router.put(
  "/cover/edit/:story_id",
  isAdminCreator,
  validate(schema.updateStory),
  storyController.updateStory
);

router.patch(
  "/requestStory",
  isAdminCreator,
  validate(schema.approval),
  storyController.sendStoryForApproval
);

router.patch(
  "/approveRejectStory",
  isAdmin,
  validate(schema.acceptRejectStory),
  storyController.approveRejectStory
);

router.get(
  "/status",
  isAdminCreator,
  validate(schema.activeStory),
  storyController.getActiveStory
);
router.get("/:id", isAdminCreator, validate(schema.getStory), storyController.getStory);

router.get(
  "/:id/scene/:number",
  isAdminCreator,
  validate(schema.getScene),
  sceneController.getScene
);

router.put(
  "/cover/deleteItem",
  isAdminCreator,
  storyController.deleteStatItem
);


module.exports = router;
