const { Router } = require("express");
const choiceController = require("./controller");
const { validate ,isAdminCreator} = require("../../../middlewares");
const schema = require("./schema");

const router = Router({ mergeParams: true });

router.post("/add",isAdminCreator, validate(schema.addChoice), choiceController.addChoice);
router.post(
  "/delete/:choice_id",
  isAdminCreator,
  validate(schema.deleteChoice),
  choiceController.deleteChoice
);
router.put(
  "/edit/:scene_id",
  isAdminCreator,
  validate(schema.updateChoice),
  choiceController.updateChoice
);

router.get(
  "/variables/:id",
  isAdminCreator,
  validate(schema.getVariables),
  choiceController.getVariables
);

// router.post("/signup", );

module.exports = router;