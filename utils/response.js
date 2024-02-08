const successMessage = {
  SIGNUP_SUCCESSFUL: "You've successfully signed up",
  LOGIN_SUCCESSFUL: "User logged in successfully",
  USER_REGISTERED_LOGIN:
    "User registered successfully. Please login to verify your account.",
  API_SUCCESS: "Success",
  NOT_FOUND: "Data not found",
  LOGOUT_SUCCESSFUL: "User logged out successfully",
  PASSWORD_UPDATED: "Password changed successfully",
  FORGOT_PASSWORD: "Reset link Sent on your mail",
  PASSWORD_NOT_MATCHED: "Your old password is Incorrect",
  DELETED: "Deleted successfully.",
  OTP_SENT: "A verification code is sent on your email id ",
  VERIFIED: " Otp verified successfully",
  EMAIL_VERIFIED: "Email verified successfully ",
  INVITATION_SENT: "Invitation sent to the creator successfully",
  STORY_FETCHED: "Story fetched successfully",
  STORY_ADDED: "Story added successfully",
  SCENE_FETCHED: "Story fetched successfully",
  SCENE_ADDED: "Story added successfully",
  UPDATED: "Updated Successfully",
  FETCHED: "Fetched successfully",
  OTP_ALREADY_SENT: "Otp is already sent.",
  WRONG_OTP: "Please enter the correct OTP.",
  NOT_CREATOR_STORY: "This Story does not belong to the current creator.",
  NOT_CREATOR_SCENE: "This Scene does not belong to the current creator.",
  CHOICE_DEFINED: "Choice defined successfully",
  CHOICE_DELETED: "Choice deleted successfully",
  CHOICE_UPDATED: "Choice updated successfully",
  WRONG_PASSWORD: "Your password is incorrect.",
  LOGIN_SUCCESSFUL: "User logged in successfully.",
  STORY_NOT_FOUND: "Story not found",
  USER_NOT_FOUND: "User doesn't exist",
  USER_CHOICE: "User choice added successfully",
  SCENE_NOT_FOUND: "Scene not found",
  SCENE_ADDED: "Scene added successfully",
  CHOICE_NOT_FOUND: "Choice not found",
  SCENE_FETCHED: "Scene fetched successfully",
  IMAGE_ADDED: "Image Added successfully",
  CHOICE_ALREADY_DEFINED: "Choice is already defined",
  USER_DELETED: "User Successfully Deleted",
  USER_UNBLOCKED: "User Successfully Unblocked",
  USER_BLOCKED: "User Successfully Blocked",
  UNLINK_CHOICE: "Please unlink the scene from choices of given scene",
  STATSET_REQUIRE: "Atleast one statset is required"
};

const errorMessage = {
  TOKEN_EXPIRED: "Token Expired resend again",
  SESSION_EXPIRE: "Your session is expired",
  ALREADY_REGISTERED: "Email already registered",
  UPDATE_ERROR: "Error in updating data.",
  API_ERROR: "Error in Api Execution.",
  VALIDATION_ERROR: "Validation error.",
  FAILED_TO_ADD: "Failed to Add Data.",
  INVALID_CREDENTIALS: "Invalid Credentials",
  EMAIL_FAILURE: "Email not sent.",
  EMAIL_ALREADY_EXISTS: "Email already exists.",
  UNAUTHORISED: "Unauthorized Access.",
  FAILED_TO_UPDATE: "You can't Update.",
  FAILED_TO_DELETE: "Failed to Delete Data.",
  INTERNAL_SERVER_ERROR: "Internal server error",
  INVALID_EMAIL: "invalid email id",
  INVALID_OTP: "invalid otp",
  SIGNUP_FAILED: "Your signUp failed",
  EMAIL_NOT_VERIFIED: "Email is not verified",
  INVALID_TOKEN: "Your token is invalid.",
  INVALID_INPUT:"Your input is invalid",
  EMAIL_NOT_SENT: "Your email address is not a valid.",
  MISSING_TOKEN: "Missing token",
  MISSING: "Parameter is missing",
  IMAGE_NOT_ADDED: "Image not Added successfully",
  NOT_VALID_IMAGE: "Image type is not valid",
  IMAGE_IS_LARGE: "Image size is too large",
  UNIQUE_TITLE: "cover_title must be unique",
  UNIQUE_DESCRIPTION: "cover_description must be unique",
  THRESHOLD_TOO_HIGH:"Threshold value must be less than baseline value",
  LINK_EXPIRED:"Link has been expired",
};

exports.success = (result, res, code) => {
  try {
    const response = {
      success: true,
      status_code: code,
      message: successMessage[result.msgCode],
      result: result.data ? result.data : "",
      time: Date.now(),
    };
    res.status(code).json(response);
  } catch (error) {
    console.log(
      "🚀 ~ file: response.js ~ line 12 ~ exports.success= ~ error",
      error
    );
    return res.json({
      success: true,
      status_code: 500,
      message: "Internal Server Error.",
      result: "",
      time: Date.now(),
    });
  }
};

exports.error = (error, res, code) => {
  try {
    const response = {
      success: false,
      status_code: code,
      message: errorMessage[error.msgCode],
      result: {
        error: error.data ? error.data : "error",
      },
      time: Date.now(),
    };
    res.status(code).json(response);
  } catch (err) {
    console.log(
      "🚀 ~ file: response.js ~ line 23 ~ exports.success= ~ err",
      err
    );

    return res.status(500).json({
      success: false,
      status_code: 500,
      message: "Internal Server error.",
      result: "",
      time: Date.now(),
    });
  }
};