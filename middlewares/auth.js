const jwt = require("jsonwebtoken");
const { env } = process;
const secretKey = env.SECRET; 
const response = require("../utils/response");
const httpStatus = require("http-status-codes");
const { common } = require("../services/index");
const { User } = require('../models/index')

const generateAuthJwt = (payload) => {
  const { expires_in, ...parms } = payload;
  const token = jwt.sign(parms, secretKey, { expiresIn: expires_in });
  if (!token) {
    return false;
  }
  return token;
};

const verifyAuthToken = async (req, res, next) => {
  try {
    let token = req.headers["authorization"];
    if (!token) {
      return response.error(
        { msgCode: "TOKEN_REQUIRED" },
        res,
        httpStatus.StatusCodes.BAD_REQUEST
      );
    }
    token = token.replace(/^Bearer\s+/, "");
    jwt.verify(token, secretKey, async (error, decoded) => {
      if (error) {
        console.log(
          "🚀 ~ file: auth.js ~ line 128 ~ jwt.verify ~ error",
          error
        );
        return response.error(
          { msgCode: "INVALID_TOKEN" },
          res,
          httpStatus.StatusCodes.BAD_REQUEST
        );
      }
      req.data = decoded;
      return next();
    })
  } catch (error) {
    console.log(
      "🚀 ~ file: auth.js ~ line 38 ~ exports.verifyAuthToken=async ~ error",
      error
    );
    return response.error(
      { msgCode: "INTERNAL_SERVER_ERROR" },
      res,
      httpStatus.StatusCodes.INTERNAL_SERVER_ERROR
    );
  }
};

const isAdmin = async (req, res, next) => {
  try {
    const decode = req.data;
    if (decode.user_type != 3) {
      return response.error(
        { msgCode: "INVALID_TOKEN" },
        res,
        httpStatus.StatusCodes.BAD_REQUEST
      );
    }
    const findUser = await common.getById(User.model, req.data.user_id);
      if(findUser.status!=1){
        return response.error(
          { msgCode: "SESSION_EXPIRE" },
          res,
          httpStatus.StatusCodes.UNAUTHORIZED
        );
      }
    next();
  } catch (error) {
    console.log("🚀 ~ file: auth.js ~ line 56 ~ isAdmin ~ error", error);
    return response.error(
      { msgCode: "INTERNAL_SERVER_ERROR" },
      res,
      httpStatus.StatusCodes.INTERNAL_SERVER_ERROR
    );
  }
};

const isAdminCreator = async (req, res, next) => {
  try {
    const decode = req.data;
    if (decode.user_type != 2 && decode.user_type != 3) {
      return response.error(
        { msgCode: "INVALID_TOKEN" },
        res,
        httpStatus.StatusCodes.BAD_REQUEST
      );
    }
    const findUser = await common.getById(User.model, decode.user_id);
      if(findUser.status!=1){
        return response.error(
          { msgCode: "SESSION_EXPIRE" },
          res,
          httpStatus.StatusCodes.UNAUTHORIZED
        );
      }
    next();
  } catch (error) {
    console.log("🚀 ~ file: auth.js ~ line 78 ~ isAdminCreator ~ error", error);
    return response.error(
      { msgCode: "INTERNAL_SERVER_ERROR" },
      res,
      httpStatus.StatusCodes.INTERNAL_SERVER_ERROR
    );
  }
};

const isCreator = async (req, res, next) => {
  try {
    const decode = req.data;
    if (decode.user_type != 2) {
      return response.error(
        { msgCode: "INVALID_TOKEN" },
        res,
        httpStatus.StatusCodes.BAD_REQUEST
      );
    }
    next();
  } catch (error) {
    console.log("🚀 ~ file: auth.js ~ line 99 ~ isCreator ~ error", error);
    return response.error(
      { msgCode: "INTERNAL_SERVER_ERROR" },
      res,
      httpStatus.StatusCodes.INTERNAL_SERVER_ERROR
    );
  }
};

module.exports = {
  generateAuthJwt,
  verifyAuthToken,
  isAdmin,
  isAdminCreator,
  isCreator
};
