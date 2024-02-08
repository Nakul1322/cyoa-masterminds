const { Router } = require("express");

const userController = require("./user");
const authController = require("./auth");
const storyController = require("./story");
const sceneController = require("./scene");
const choiceController = require("./choice");
const { verifyAuthToken } = require("../../middlewares");

const router = Router();

router.use("/auth", authController);
router.use(verifyAuthToken);
router.use("/user", userController);
router.use("/story", storyController);
router.use("/scene", sceneController);
router.use("/choice", choiceController);

module.exports = router;
