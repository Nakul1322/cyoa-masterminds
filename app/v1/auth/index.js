const { Router } = require("express");
const authController = require("./controller");
const { validate, verifyAuthToken,isAdmin,isAdminCreator,isCreator } = require("../../../middlewares/index");
const schema = require("./schema");

const router = Router({ mergeParams: true });

router.post(
  "/login",
  validate(schema.login),
  authController.login,
  authController.generateSession
);
router.post("/send-otp", validate(schema.sendOTP), authController.sendOtp);
router.post(
  "/verify-otp",
  verifyAuthToken,
  isAdminCreator,
  validate(schema.verifyOTP),
  authController.verifyOtp
);
router.patch(
  "/change-password",
  verifyAuthToken,
  isAdminCreator,
  validate(schema.resetPassword),
  authController.changePassword
);
router.post(
  "/creator/send-invite",
  verifyAuthToken,
  isAdmin,
  validate(schema.sendInvite),
  authController.sendInvite
);
router.get("/getEmail",verifyAuthToken,isCreator,authController.getEmail);
router.post(
  "/creator/signup",
  verifyAuthToken,
  isCreator,
  validate(schema.creatorSignup),
  authController.signUp
);
router.post("/logout", verifyAuthToken,isAdminCreator, authController.logOut);
router.get("/getProfile", verifyAuthToken, isAdminCreator,authController.getProfile);
module.exports = router;
