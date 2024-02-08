const { Types } = require("mongoose");
const { Choice } = require("../models/index")

const updateBySceneId = async (id, content) => {
  try {
    const data = await Choice.model.findOneAndUpdate(
      { scene_id: Types.ObjectId(id) },
      { $set: content },
      { new: true }
    );
    return data;
  } catch (error) {
    return false;
  }
};

const removeChoiceBySceneId = async (id) => {
  try {
    const data = await Choice.model.findOneAndRemove({
      scene_id: Types.ObjectId(id),
    });
    return data;
  } catch (error) {
    return false;
  }
};

const findChoice = async(id)=>{
  try{
    const data = await Choice.model.findOne(
      { scene_id: Types.ObjectId(id) }
    );
    return data;
  }
  catch(error){
    return false;
  }
}


module.exports = {
  updateBySceneId,
  removeChoiceBySceneId,
  findChoice
};
