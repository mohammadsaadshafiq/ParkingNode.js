var UserModel = require("../models/user.model").getUserModel;

exports.SaveNewUserInDB = function (Obj) {
  let user = new UserModel(Obj);
  return user.save();
};

exports.UpdateUserInDB = function (
  queryObj,
  updatesObj,
) {
  return UserModel.updateOne(queryObj, updatesObj, {
    upsert: false
  });
};

exports.FindUserFromDB = function (
  isSingle,
  query,
  selectParams,
  populateParams,
  sortParams,
  limit,
  skip,
  isLeanNotRequired
) {
  if (isSingle) {
    if (isLeanNotRequired) {
      return UserModel.findOne(query)
        .select(selectParams || { password: false, Salt: false })
        .populate(populateParams || "")
        .exec();
    }
    else {
      return UserModel.findOne(query)
        .select(selectParams || { password: false, Salt: false })
        .populate(populateParams || "")
        .lean()
        .exec();
    }
  } else {
    return UserModel.find(query)
      .select(selectParams || "")
      .populate(populateParams || "")
      .limit(limit || 0)
      .skip(skip || 0)
      .sort(sortParams || "")
      .lean()
      .exec();

  }
};


