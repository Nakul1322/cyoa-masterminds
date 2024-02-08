const { Router } = require("express");
const sceneController = require("./controller");
const { validate,isAdminCreator } = require("../../../middlewares");
const schema = require("./schema");

const router = Router({ mergeParams: true });


router.get("/sceneTree/:storyId",isAdminCreator, validate(schema.getTree),
sceneController.getSceneTree);

router.post("/add",isAdminCreator,validate(schema.addScene),
  sceneController.addScene);

router.delete(
  "/delete/:story_id/:scene_index",
  isAdminCreator,
  validate(schema.deleteScene),
  sceneController.deleteScene,
  sceneController.deleteAndUpdateIndex
);

router.put(
  "/edit/:scene_id",
  isAdminCreator,
  validate(schema.updateScene),
  sceneController.updateScene
);

router.get(
  "/redirection",
  isAdminCreator,
  validate(schema.redirection),
  sceneController.redirectionScreen
);


// router.post("/signup", );

module.exports = router;
