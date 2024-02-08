const { Types } = require("mongoose");

const create = async (Model, profile) => {
  try {
    const data = new Model(profile).save();
    return data;
    // const data = Model.create(profile)
    // return data
  } catch (err) {
    return false;
  }
};

const getById = async (Model, id) => {
  try {
    const data = await Model.findById(id);
    return data;
  } catch (error) {
    return false;
  }
};

const removeById = async (Model, id) => {
  try {
    const data = await Model.findByIdAndRemove(id);
    return data;
  } catch (error) {
    return false;
  }
};

const updateById = async (Model, id, content) => {
  try {
    const data = await Model.findByIdAndUpdate(
      id,
      { $set: content },
      { new: true }
    );
    return data;
  } catch (error) {
    return false;
  }
};

const updateOne = async (Model, condition, content) => {
  try {
    const data = await Model.findOneAndUpdate(
      condition,
      { $set: content },
      { new: true }
    );
    return data;
  } catch (error) {
    return false;
  }
};

const insertManyData = async (Model, content) => {
  try {
    const data = Model.insertMany(content);
    return data;
  } catch (err) {
    return false;
  }
};

const deleteByField = async (Model, content) => {
  try {
    const data = await Model.findOneAndRemove(content);
    return data;
  } catch (err) {
    return false;
  }
}

const findObject = async (Model, content) => {
  try {
    const data = await Model.findOne(content);
    return data;
  } catch (err) {
    return false;
  }
}

const push = async (Model, condition, content) => {
  try {
    const data = Model.updateOne(condition, { $push: content });
    return data;
  } catch (err) {
    return false;
  }
}

const getByCondition = async (Model, condition) => {
  try {
    const data = await Model.find(condition);
    return data;
  } catch (error) {
    return false;
  }
};

const pullObject = async (Model, condition, content) => {
  try {
    const data = Model.findOneAndUpdate(condition, { $pull: content },{new:true});
    return data;
  } catch (err) {
    return false;
  }
}


module.exports = {
  create,
  getById,
  removeById,
  updateById,
  updateOne,
  push,
  insertManyData,
  deleteByField,
  findObject,
  getByCondition,
  pullObject
};
