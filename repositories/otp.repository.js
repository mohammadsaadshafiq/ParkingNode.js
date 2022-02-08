var OTPModel = require("../models/otp.model").getOTPModel;

exports.SaveNewOTPInDB = function (Obj) {
  let OTP = new OTPModel(Obj);
  return OTP.save();
};

exports.UpdateOTPInDB = function (
  queryObj,
  updatesObj,
  
) {
  return OTPModel.updateOne(queryObj, updatesObj, {
    upsert: false,
  });
};

exports.FindOTPFromDB = function (
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
      return OTPModel.findOne(query)
        .select(selectParams || { password: false, Salt: false })
        .populate(populateParams || "")
        .exec();
    }
    else {
      return OTPModel.findOne(query)
        .select(selectParams || { password: false, Salt: false })
        .populate(populateParams || "")
        .lean()
        .exec();
    }
  } else {
    return OTPModel.find(query)
      .select(selectParams || "")
      .populate(populateParams || "")
      .limit(limit || 0)
      .skip(skip || 0)
      .sort(sortParams || "")
      .lean()
      .exec();

  }
};


