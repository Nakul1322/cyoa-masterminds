const httpStatus = require("http-status");
const {
  sendEmail,
  generateOtp,
  genUUID,
  helperPassword,
  response,
} = require("../../../utils/index");
const { users, common } = require("../../../services/index");
const { User } = require("../../../models/index");
const { generateAuthJwt } = require("../../../middlewares/index");
const config = require("../../../config/index");

const login = async (req, res, next) => {
  try {
    const data = req.body;
    //identifying who is performing login
    if (!data.story_id && data.email) {
      //calling admin creator login function
      const adminLogin = await users.adminCreatorLogin(data);
      if (adminLogin == 0) {
        return response.success(
          { msgCode: "USER_NOT_FOUND" },
          res,
          httpStatus.NOT_FOUND
        );
      }
      const userData = await common.findObject(User.model, {
        email: { $regex: new RegExp(req.body.email, "i") },
      });
      if (userData.status != 1) {
        return response.success(
          { msgCode: "USER_NOT_FOUND" },
          res,
          httpStatus.NOT_FOUND
        );
      }
      if (adminLogin == 1) {
        return response.success(
          { msgCode: "WRONG_PASSWORD" },
          res,
          httpStatus.UNAUTHORIZED
        );
      }
      //passing data to be used in next function
      req.loginData = adminLogin;
      return next();
    }
    //else condition for user based login
    const userlogin = await users.userLogin(data);
    if (userlogin == 0) {
      return response.success(
        { msgCode: "STORY_NOT_FOUND" },
        res,
        httpStatus.NOT_FOUND
      );
    }
    if (userlogin == 1) {
      return response.success(
        { msgCode: "STORY_NOT_FOUND" },
        res,
        httpStatus.NOT_FOUND
      );
    }
    //passing data to be used in next function
    req.loginData = userlogin;
    return next();
  } catch (error) {
    console.log(
      "🚀 ~ file: controller.js ~ line 15 ~ generateSession ~ error",
      error
    );
    return response.error(
      { msgCode: "INTERNAL_SERVER_ERROR" },
      res,
      httpStatus.INTERNAL_SERVER_ERROR
    );
  }
};

const generateSession = async (req, res) => {
  try {
    //fetching data from previous middleware
    const data = req.loginData;
    //generating token using that data
    const token = generateAuthJwt(data);
    const device_info = {
      device_id: data.device_id,
      device_type: data.device_type,
      device_token: data.device_token,
      jwt: token,
    };
    //updating device info of user
    const updateInfo = await common.updateById(User.model, data.user_id, {
      device_info: device_info,
    });
    //fetching token
    const info = updateInfo.device_info[0];
    //response data
    const result = {
      _id: updateInfo._id,
      name: updateInfo.name,
      email: updateInfo.email,
      status: updateInfo.status,
      user_type: updateInfo.user_type,
      created_at: updateInfo.createdAt,
      updated_at: updateInfo.updatedAt,
      token: info.jwt,
    };
    return response.success(
      {
        msgCode: "LOGIN_SUCCESSFUL",
        data: result,
      },
      res,
      httpStatus.ACCEPTED
    );
  } catch (error) {
    console.log(
      "🚀 ~ file: controller.js ~ line 63 ~ generateSession ~ error",
      error
    );
    return response.error(
      { msgCode: "INTERNAL_SERVER_ERROR" },
      res,
      httpStatus.INTERNAL_SERVER_ERROR
    );
  }
};

const sendOtp = async (req, res) => {
  try {
    const { email } = req.body;
    //find user
    const findUser = await users.findUser(email);
    if (!findUser || findUser.status != 1) {
      return response.success(
        { msgCode: "USER_NOT_FOUND" },
        res,
        httpStatus.NOT_FOUND
      );
    }
    //if user exist generate token
    const token = generateAuthJwt({
      user_id: findUser._id,
      user_type: findUser.user_type,
      expires_in: config.expireIn,
    });
    const device_info = {
      jwt: token,
    };
    // //check if otp is already sent and not expired
    // if (findUser.otp != null) {
    //   const update = await users.updateOne(email, {
    //     device_info: device_info,
    //   });
    //   return response.success(
    //     { msgCode: "OTP_ALREADY_SENT", data: { token: token } },
    //     res,
    //     httpStatus.OK
    //   );
    // }
    //generating otp
    const otp = generateOtp(4).toString();
    //update token and otp
    const update = await users.updateOne(email, {
      otp: otp,
      device_info: device_info,
    });
    const file = "verifyOTP.ejs"; //emailTemplate
    //nodemailer to send email
    sendEmail(file, email, "verification OTP", otp);
    return response.success(
      { msgCode: "OTP_SENT", data: { token: token } },
      res,
      httpStatus.OK
    );
  } catch (error) {
    console.log("🚀 ~ file: controller.js ~ line 110 ~ sendOTP ~ error", error);
    return response.error(
      { msgCode: "INTERNAL_SERVER_ERROR" },
      res,
      httpStatus.INTERNAL_SERVER_ERROR
    );
  }
};

const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    //find user
    const findUser = await users.findUser(email);
    if (!findUser) {
      return response.success(
        { msgCode: "USER_NOT_FOUND" },
        res,
        httpStatus.NOT_FOUND
      );
    }
    //verify otp
    if (findUser.otp != otp) {
      return response.success(
        { msgCode: "WRONG_OTP" },
        res,
        httpStatus.NOT_ACCEPTABLE
      );
    }
    //empty otp field by updating
    const update = await users.updateOne(email, { otp: null });
    return response.success(
      { msgCode: "EMAIL_VERIFIED", data: {} },
      res,
      httpStatus.ACCEPTED
    );
  } catch (error) {
    console.log(
      "🚀 ~ file: controller.js ~ line 160 ~ verifyOTP ~ error",
      error
    );
    return response.error(
      { msgCode: "INTERNAL_SERVER_ERROR" },
      res,
      httpStatus.INTERNAL_SERVER_ERROR
    );
  }
};

const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const decode = req.data;
    //find user using token
    const findUser = await common.getById(User.model, decode.user_id);
    if (!findUser) {
      return response.success(
        { msgCode: "USER_NOT_FOUND" },
        res,
        httpStatus.NOT_FOUND
      );
    }
    //checking what to perform reset or change password
    if (!oldPassword) {
      //generate hash of newPassword
      const hashPassword = await helperPassword.generateHash(newPassword);
      const updatePassword = await common.updateById(User.model, findUser._id, {
        password: hashPassword,
      });
      return response.success(
        { msgCode: "PASSWORD_UPDATED", data: {} },
        res,
        httpStatus.ACCEPTED
      );
    }
    //const Pwd = await helperPassword.generateHash(oldPassword);
    const hashPassword = await helperPassword.generateHash(newPassword);
    //match old and new password
    const isMatch = await helperPassword.comparePassword(
      oldPassword,
      findUser.password
    );
    if (!isMatch) {
      return response.success(
        { msgCode: "PASSWORD_NOT_MATCHED" },
        res,
        httpStatus.UNAUTHORIZED
      );
    }
    //update new password
    const update = await common.updateById(User.model, findUser._id, {
      password: hashPassword,
    });
    return response.success(
      { msgCode: "PASSWORD_UPDATED", data: {} },
      res,
      httpStatus.ACCEPTED
    );
  } catch (error) {
    console.log(
      "🚀 ~ file: controller.js ~ line 200 ~ changePassword ~ error",
      error
    );
    return response.error(
      { msgCode: "INTERNAL_SERVER_ERROR" },
      res,
      httpStatus.INTERNAL_SERVER_ERROR
    );
  }
};

const sendInvite = async (req, res) => {
  try {
    const { name, email } = req.body;
    //find user
    const findUser = await users.findUser(email);
    if (findUser) {
      return response.error(
        { msgCode: "ALREADY_REGISTERED" },
        res,
        httpStatus.FORBIDDEN
      );
    }
    //generating token
    const payload = {
      name: name,
      email: email,
      user_type: 2,
      expires_in: config.expireIn,
    };
    const token = await generateAuthJwt(payload);
    const file = "sendInvite.ejs"; //emailTemplate
    //link generation for login
    const url = config.SERVER_URL;
    const link = `${url}/signup?accesstoken=` + token;
    //nodemailer to send email
    sendEmail(file, email, "Invitation Link", link);

    response.success(
      { msgCode: "INVITATION_SENT", data: link },
      res,
      httpStatus.ACCEPTED
    );
  } catch (error) {
    console.log(
      "🚀 ~ file: controller.js ~ line 261 ~ sendInvite ~ error",
      error
    );
    return response.error(
      { msgCode: "INTERNAL_SERVER_ERROR" },
      res,
      httpStatus.INTERNAL_SERVER_ERROR
    );
  }
};

const getEmail = async (req, res) => {
  try {
    const decode = req.data;
    const email = decode.email;
    const findUser = await User.model.findOne({ email });
    if (findUser) {
      return response.error(
        { msgCode: "LINK_EXPIRED" },
        res,
        httpStatus.FORBIDDEN
      );
    }
    response.success(
      { msgCode: "FETCHED", data: email },
      res,
      httpStatus.OK
    );
  } catch (error) {
    console.log("🚀 ~ file: controller.js ~ line 301 ~ signup ~ error", error);
    return response.error(
      { msgCode: "INTERNAL_SERVER_ERROR" },
      res,
      httpStatus.INTERNAL_SERVER_ERROR
    );
  }
};

const signUp = async (req, res) => {
  try {
    const { password } = req.body;
    const decode = req.data;

    // Check if the user already exists
    const findUser = await users.findUser(decode.email);
    if (findUser) {
      return response.error(
        { msgCode: "ALREADY_REGISTERED" },
        res,
        httpStatus.FORBIDDEN
      );
    }

    // Hash the password
    const hashPassword = await helperPassword.generateHash(password);
    const profile = {
      name: decode.name,
      email: decode.email,
      password: hashPassword,
      user_type: 2,
    };

    // Create the user
    const data = await common.create(User.model, profile);
    if (!data) {
      return response.error(
        { msgCode: "FAILED_TO_ADD" },
        res,
        httpStatus.FORBIDDEN
      );
    }

    return response.success(
      { msgCode: "SIGNUP_SUCCESSFUL", data: {} },
      res,
      httpStatus.CREATED
    );
  } catch (error) {
    console.log("🚀 ~ file: controller.js ~ line 301 ~ signup ~ error", error);
    return response.error(
      { msgCode: "INTERNAL_SERVER_ERROR" },
      res,
      httpStatus.INTERNAL_SERVER_ERROR
    );
  }
};

const getProfile = async (req, res) => {
  try {
    const decode = req.data;
    //find user
    const findUser = await common.getById(User.model, decode.user_id);
    if (!findUser) {
      return response.success(
        { msgCode: "USER_NOT_FOUND" },
        res,
        httpStatus.NOT_FOUND
      );
    }
    const result = {
      name: findUser.name,
      email: findUser.email,
    };
    return response.success(
      { msgCode: "FETCHED", data: result },
      res,
      httpStatus.OK
    );
  } catch (error) {
    console.log(
      "🚀 ~ file: controller.js ~ line 349 ~ getProfile ~ error",
      error
    );
    return response.error(
      { msgCode: "INTERNAL_SERVER_ERROR" },
      res,
      httpStatus.INTERNAL_SERVER_ERROR
    );
  }
};

const logOut = async (req, res) => {
  try {
    //fetching data from token
    const decode = req.data;
    const data = await common.getById(User.model, decode.user_id);
    if (!data) {
      return response.success(
        { msgCode: "USER_NOT_FOUND" },
        res,
        httpStatus.NOT_FOUND
      );
    }
    //null device info
    const update = await common.updateById(User.model, data._id, {
      device_info: null,
    });
    if (!update) {
      return response.error(
        { msgCode: "UPDATE_ERROR" },
        res,
        httpStatus.FORBIDDEN
      );
    }

    return response.success(
      { msgCode: "LOGOUT_SUCCESSFUL", data: {} },
      res,
      httpStatus.ACCEPTED
    );
  } catch (error) {
    console.log("🚀 ~ file: controller.js ~ line 381 ~ logout ~ error", error);
    return response.error(
      { msgCode: "INTERNAL_SERVER_ERROR" },
      res,
      httpStatus.INTERNAL_SERVER_ERROR
    );
  }
};

module.exports = {
  login,
  signUp,
  sendOtp,
  verifyOtp,
  changePassword,
  logOut,
  sendInvite,
  generateSession,
  getProfile,
  getEmail,
};
