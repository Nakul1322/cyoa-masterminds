const response = require("../utils/response");
const httpStatus = require("http-status");

const validate =
  (schema, source = "body") =>
  async (req, res, next) => {
    const data = req[source];

    const { error } = schema.validate(data);
    const valid = error == null;
    if (valid) {
      return next();
    } else {
      const { details } = error;
      const message = details.map((i) => i.message).join(",");
      return response.error(
        { msgCode: "VALIDATION_ERROR", data: message },
        res,
        httpStatus.BAD_REQUEST
      );
    }
  };

module.exports = {
  validate,
};
