const { v4: uuidv4 } = require("uuid");
const cheerio = require("cheerio");

const genUUID = () => {
  const uuid = uuidv4();
  return uuid;
};

const generateOtp = (digit) => {
  const otp = Math.floor(
    10 ** (digit - 1) + Math.random() * (10 ** (digit - 1) * 9)
  );
  return otp;
};

const getPagination = (page, size) => {
  const limit = size ? size : 12;
  const offset = page ? (page - 1) * limit : 0;
  return { limit, offset };
};

const getSort = (sort, order) => {
  const orderBy = {
    asc: 1,
    desc: -1,
  };
  let sortingFilter = {};
  if (sort != "" && sort != undefined && sort != "undefined") {
    if (order != "" && order != undefined && order != "undefined") {
      sort = sort.trim();
      order = order.trim();
      sortingFilter[sort] = orderBy[order];
    }
  } else {
    sortingFilter = { approved_date: -1 };
  }
  return sortingFilter;
};

const getSearch = (search) => {
  let searchCase = {};
  if (search) {
    searchCase = {
      $or: [
        {
          cover_title: { $regex: search.trim(), $options: "i" },
        },
        {
          description: { $regex: search.trim(), $options: "i" },
        },
        {
          name: { $regex: search.trim(), $options: "i" },
        },
      ],
    };
  }
  return searchCase;
};

const userAggregation = () => {
  const userAggre = {
    from: "users",
    let: { creatorId: "$creator_id" },
    pipeline: [
      { $match: { $expr: { $eq: ["$_id", "$$creatorId"] } } },
      { $project: { name: 1 } },
    ],
    as: "creator_name",
  };
  return userAggre;
};

const storyAggregation = () => {
  const storyLookup = {
    from: "stories",
    localField: "story_id",
    foreignField: "_id",
    as: "story_info",
  };
  return storyLookup;
};

const creatorNameAggregation = () => {
  const creatorNameLookup = {
    from: "users",
    localField: "story_info.creator_id",
    foreignField: "_id",
    as: "user_info",
  };
  return creatorNameLookup;
};

const choiceAggregation = () => {
  const choiceLookup = {
    from: "choices",
    let: { sceneId: "$_id" },
    pipeline: [{ $match: { $expr: { $eq: ["$scene_id", "$$sceneId"] } } }],
    as: "choice",
  };
  return choiceLookup;
};

const statAggregation = () => {
  const statLookup = {
    from: "statsets",
    localField: "stat_set",
    foreignField: "_id",
    as: "stat_set",
  };
  return statLookup;
};

const creatorAggregation = () => {
  const creatorLookup = {
    from: "users",
    let: { creator_id: "$creator_id" }, // Use the correct field name from the story collection
    pipeline: [
      { $match: { $expr: { $eq: ["$_id", "$$creator_id"] } } },
      {
        $project: {
          _id: 0,
          creator_name: "$name", // Assuming the name field is in the users collection
        },
      },
    ],
    as: "creator",
  };
  return creatorLookup;
};

const choiceAggre = () => {
  const choiceLookup = {
    from: "choices",
    let: { sceneId: "$_id" },
    pipeline: [
      { $match: { $expr: { $eq: ["$scene_id", "$$sceneId"] } } },
      { $unwind: "$choices" },
      {
        $project: {
          _id: 1,
          title: [
            {
              $concat: [
                "scene ",
                {
                  $toString:
                    "$choices.condition.variable.true_linked_scene_index",
                },
              ],
            },
            {
              $concat: [
                "scene ",
                {
                  $toString:
                    "$choices.condition.variable.false_linked_scene_index",
                },
              ],
            },
          ],
        },
      },
      { $unwind: "$title" },
      {
        $group: {
          _id: "$_id",
          children: {
            $addToSet: {
              name: "$title",
            },
          },
        },
      },
    ],
    as: "choice",
  };
  return choiceLookup;
};

const customDescriptionValidator = (value) => {
  // Load the HTML string into a Cheerio instance
  const $ = cheerio.load(value);

  // Extract the text content from the HTML
  const textContent = $.text();
  console.log(textContent.length);
  // Validate the length of the extracted text content
  if (textContent.length > 500) {
    throw new Error("Text content length exceeds 500 characters");
  }

  return textContent;
};

module.exports = {
  genUUID,
  generateOtp,
  getPagination,
  getSort,
  getSearch,
  userAggregation,
  storyAggregation,
  choiceAggregation,
  statAggregation,
  choiceAggre,
  creatorAggregation,
  creatorNameAggregation,
  customDescriptionValidator
};
