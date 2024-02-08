const { User,Story, StatSet, Statset } = require("../models/index");
const { Types } = require("mongoose");
const {
  getPagination,
  getSort,
  getSearch,
  userAggregation,
  statAggregation,
  creatorAggregation
} = require("../utils/index");
const common  = require("../services/common");

const findStoryOfCreator = async (id, creator_id) => {
  try {
    const value = await Story.model.findOne({
      _id: Types.ObjectId(id),
      creator_id: creator_id,
    });
    return value;
  } catch (err) {
    return false;
  }
};

const getStatSetOfStory = async (id) => {
  try {
    const statLookup = statAggregation();
    const creatorLookup = creatorAggregation();
    const data = await Story.model.aggregate([
      { $match: { _id: Types.ObjectId(id) } },
      { $lookup: statLookup },
      { $lookup: creatorLookup },
      { $unwind:{path:'$creator', preserveNullAndEmptyArrays:true} },
      {
        $project: {
          _id: 1,
          creator_id: 1,
          cover_title: 1,
          status:1,
          rejectReason:1,
          cover_description: 1,
          cover_image: 1,
          threshold: 1,
          baseline: 1,
          isPaid: 1,
          createdAt: 1,
          updatedAt: 1,
          requested_date: 1,
          sceneCount: 1,
          approved_date: 1,
          stat_set: 1,
          creator_name: '$creator.creator_name',
        },
      },
    ]);
    return data;
  } catch (error) {
    return false;
  }
};

const findStoryByStatus = async (id, status, page, size, order, sort, search) => {
  try {
    const value = parseInt(status);

    //pagination
    const limitOffset = getPagination(page, size);
    const skip = Number(limitOffset.offset);
    const limit = Number(limitOffset.limit);

    let creator = {};
    const findUser= await common.getById(User.model,id);
    if(findUser.user_type==2||status==0){
      creator = {creator_id:Types.ObjectId(id)}
    }

    //sorting
    const sorting = getSort(sort, order);

    //searching
    const searching = getSearch(search);

    //aggregation
    const userAggre = userAggregation();

    //projection
    const project = {
      _id: 1,
      creator_id: 1,
      creator_name: { $arrayElemAt: ["$creator_name", 0] },
      cover_title: 1,
      cover_image: 1,
      cover_description: 1,
      requested_date: 1,
      approved_date: 1,
      updatedAt:1,
      rejection_date:1
    };

    //group
    const group = {
      _id: '$_id',
      creator_id: { $first: '$creator_id' },
      creator_name: { $first: '$creator_name.name' },
      title: { $first: '$cover_title' },
      cover_image: { $first: '$cover_image' },
      description: { $first: '$cover_description' },
      requested_at: { $first: '$requested_date' },
      approved_date: { $first: '$approved_date' },
      updated_at: { $first: '$updatedAt' },
      rejection_date:{$first:'$rejection_date'}
    }

    //query
    const data = await Story.model.aggregate([
      { $match: { status: value } },
      { $match: searching },
      { $match: creator },
      { $lookup: userAggre },
      { $unwind: { path: "$userAggre", preserveNullAndEmptyArrays: true } },
      { $project: project },
      { $group: group },
      {
        $facet: {
          count: [{ $count: 'count' }],
          data: [{ $sort: sorting }, { $skip: skip || 0 }, { $limit: limit || 10 }],
        },
      },
      {
        $addFields: {
          count: { $arrayElemAt: ['$count.count', 0] },
        },
      },
    ]);

    return data;
  } catch (error) {
    return false;
  }
};

const getStory = async (id) => {
  try {
    const userAggre = userAggregation();
    const statLookup = statAggregation();

    const data = await Story.model.aggregate([
      { $match: { _id: Types.ObjectId(id) } },
      { $lookup: userAggre },
      // { $lookup: choiceLookup },
      { $lookup: statLookup },
    ]);
    return data;
  } catch (error) {
    return false;
  }
};

const updateStoryId = async (ids, story_id) => {
  try {
    const data = await StatSet.model.updateMany(
      { _id: { $in: ids } },
      { $set: { story_id: story_id } },
      { new: true }
    );
    return data;
  } catch (error) {
    return false;
  }
};

const getAllCreatorStory = async (id, status) => {
  try {
    const data = await Story.model.find({
      creator_id: Types.ObjectId(id),
      status: status,
    });
    return data;
  } catch (error) {
    return false;
  }
};

const updateBaseline = async (id, value) => {
  try {
    const data = await Story.model.updateOne({ _id: Types.ObjectId(id) , 'baseline._id': value._id },
      { $set: { 'baseline.$': value } });
    return data;
  } catch (error) {
    return false;
  }
}

const updateItems = async (id, value) => {
  try {
    const data = await Statset.model.updateOne({ _id: Types.ObjectId(id) ,'items._id': value._id },
     { $set: { 'items.$': value } }
     );
    return data;
  } catch (error) {
    return false;
  }
}

module.exports = {
  findStoryByStatus,
  findStoryOfCreator,
  getStory,
  updateStoryId,
  getAllCreatorStory,
  getStatSetOfStory,
  updateBaseline,
  updateItems
};
