const { Router } = require("express");
const userController = require("./controller");
const { validate ,isAdmin,isAdminCreator} = require("../../../middlewares");
const schema = require("./schema");

const router = Router({ mergeParams: true });

router.patch(
  "/creator/:id/:action",
  isAdmin,
  validate(schema.creatorAction),
  userController.creatorAction
);
router.get("/creator",isAdmin, validate(schema.getCreator), userController.getCreator);

router.post(
  "/userChoice",
  validate(schema.userChoice),
  userController.userChoice
);

router.post("/userScore", validate(schema.userScore), userController.userScore);

router.get("/getStory", userController.userBasedStory);

router.get(
  "/rejectReason",
  isAdminCreator,
  validate(schema.rejectReason),
  userController.rejectReason
);

module.exports = router;
