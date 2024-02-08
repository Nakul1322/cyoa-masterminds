const { User, Story } = require("../models/index");
const {
  getPagination,
  getSort,
  helperPassword,
  getSearch,
} = require("../utils/index");
const common = require("../services/common");
const config = require("../config/index");
const { isValidObjectId } = require("mongoose");
const { Types } = require("mongoose");

const findUser = async (email) => {
  try {
    const data = await User.model.findOne({ email: email });
    return data;
  } catch (error) {
    return false;
  }
};

const adminCreatorLogin = async (data) => {
  try {
    //find user
    const isUserExist = await findUser(data.email);
    if (!isUserExist) {
      return 0;
    }
    //verify password
    const isMatch = await helperPassword.comparePassword(
      data.password,
      isUserExist.password
    );
    if (!isMatch) {
      return 1;
    }
    //data for token generation
    const content = {
      user_id: isUserExist._id,
      user_type: isUserExist.user_type,
      device_id: data.device_id,
      device_token: data.device_token,
      device_type: data.device_type,
      expires_in: config.expireIn,
    };
    return content;
  } catch (error) {
    return false;
  }
};

const userLogin = async (data) => {
  try {
    //check the ObjectId coming is valid or not
    if (!isValidObjectId(data.story_id)) {
      return 0;
    }
    //find Story
    const findStory = await common.getById(Story.model, data.story_id);
    if (!findStory) {
      return 1;
    }
    //find User
    const isUserExist = await findDeviceId(data.device_id);
    if (!isUserExist) {
      //if not then create
      const content = await createUser(data);
      return content;
    }
    //data to be used to generate token
    const content = {
      story_id: data.story_id,
      user_id: isUserExist._id,
      user_type: isUserExist.user_type,
      device_id: data.device_id,
      device_type: data.device_type,
      device_token: data.device_token,
      expires_in: config.expireIn,
    };
    return content;
  } catch (error) {
    return false;
  }
};

const createUser = async (data) => {
  try {
    const profile = {
      device_id: data.device_id,
      device_type: data.device_type,
      device_token: data.device_token,
    };
    //create user
    const user = await common.create(User.model, {
      user_type: 1,
      device_info: profile,
    });

    //data to generate token
    const content = {
      story_id: data.story_id,
      user_id: user._id,
      user_type: user.user_type,
      device_id: data.device_id,
      device_type: data.device_type,
      device_token: data.device_token,
      expires_in: config.expireIn,
    };
    return content;
  } catch (error) {
    return false;
  }
};

const updateOne = async (email, content) => {
  try {
    const data = await User.model.findOneAndUpdate(
      { email: email },
      { $set: content },
      { new: true }
    );
    return data;
  } catch (error) {
    return false;
  }
};

const findByUserType = async (id, content, page, size, sort, order, search) => {
  try {
    const value = parseInt(content);

    if (search !== "") {
      skip = 0; // skip to the beginning of the list
      limit = null; // no limit
    }
    //pagination
    const limitOffset = getPagination(page, size);
    skip = Number(limitOffset.offset);
    limit = Number(limitOffset.limit);

    let creator = {};
    if (id) {
      creator = { _id: Types.ObjectId(id) };
    }
    //sorting
    const sorting = getSort(sort, order);

    //searching
    const searching = getSearch(search);

    //grouping
    const group = {
      _id: "$_id",
      creator_id: { $first: "$_id" },
      creator_name: { $first: "$name" },
      email: { $first: "$email" },
      status: { $first: "$status" },
      created_at: { $first: "$createdAt" },
    };

    const data = await User.model.aggregate([
      { $match: { user_type: value } },
      { $match: searching },
      { $match: { status: { $ne: 0 } } },
      { $match: creator },
      { $group: group },
      { $unset: ["_id"] },
      {
        $facet: {
          count: [{ $count: "count" }],
          data: [
            { $sort: sorting },
            { $skip: skip || 0 },
            { $limit: limit || 10 },
          ],
        },
      },
      {
        $addFields: {
          count: { $arrayElemAt: ["$count.count", 0] },
        },
      },
    ]);

    return data;
  } catch (error) {
    return false;
  }
};

const findToken = async (token) => {
  try {
    const data = await User.model.findOne({ "device_info.jwt": token });
    return data;
  } catch (error) {
    return false;
  }
};

const findDeviceIdAndUpdate = async (id, update) => {
  try {
    const data = await User.model.findOneAndUpdate(
      { "device_info.device_id": id },
      { $set: { "device_info.$": update } },
      { new: true }
    );
    return data;
  } catch (error) {
    return false;
  }
};

const findDeviceId = async (id) => {
  try {
    const data = await User.model.findOne({ "device_info.device_id": id });
    return data;
  } catch (error) {
    return false;
  }
};

const findDeviceIdAndEmail = async (email, id) => {
  try {
    const data = await User.model.findOne({
      $or: [{ email: email }, { "device_info.device_id": id }],
    });

    return data;
  } catch (error) {
    return false;
  }
};

const expireInviteToken = async (email, invite_token) => {
  try {
    const data = await User.model.updateOne(
      { email, invite_token },
      { $unset: { invite_token: 1 } }
    );

    return data;
  } catch (error) {
    return false;
  }
};

module.exports = {
  findUser,
  updateOne,
  findByUserType,
  findToken,
  findDeviceIdAndUpdate,
  findDeviceId,
  findDeviceIdAndEmail,
  adminCreatorLogin,
  userLogin,
  expireInviteToken,
};
