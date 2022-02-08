const UserRepo = require("../repositories/user.repository");
const checkAuth = require("../middlewares/checkAuth");
var passport = require("passport");
var app = require('express');
const OTPRepo = require("../repositories/otp.repository");
const {
  generateOTP,
  calculateOTPExpirationTime,
  otp_Actions
} = require("../utils/otp.util");

exports.createUser = (req, res) => {
  let user = req.body;

  var checkDuplicationQuery = {
    StatusCode: { $ne: 2 },
    $or: [{ EmailID: user.EmailID }, { MobileNumber: user.MobileNumber }]
  };

  UserRepo.FindUserFromDB(
    true,
    checkDuplicationQuery,
    "EmailID MobileNumber"
  ).then(existingUsers => {
    if (
      existingUsers &&
      existingUsers.EmailID &&
      existingUsers.EmailID == user.EmailID
    ) {
      res.send({
        status: false,
        message: "A user with this Email ID already exists"
      });
      return;
    } else if (
      existingUsers &&
      existingUsers.MobileNumber &&
      existingUsers.MobileNumber == user.MobileNumber
    ) {
      res.send({
        status: false,
        message: "A user with this Mobile Number already exists"
      });
      return;
    } else {
      // generate otp
      const otp = generateOTP(6);
      // save otp to user collection
      user.phoneOtp = otp;
      let OTP_Details = {
        OTP: otp,
        Expiration_time: calculateOTPExpirationTime(),
        Action: otp_Actions.USER_CREATION
      };
      user.OTPDetails = OTP_Details;
      UserRepo.SaveNewUserInDB(user)
        .then(userData => {
          res
            .status(200)
            .json({
              status: true,
              user: userData,
              message: "Account created OTP sended to mobile number"
            });

          if (userData && userData._id) {
            OTP_Details["MobileNumber"] = userData.MobileNumber;
            OTP_Details["UserID"] = userData._id;
          }

          OTPRepo.SaveNewOTPInDB(OTP_Details);
          // sms code here

          // sms code here
        })
        .catch(err => {
          res.status(500).json({ status: false, error: err });
        });
    }
  });
};

exports.login = function(req, res, next) {
  passport.authenticate("local", function(err, user, info) {
    if (err) res.json({ status: false, message: err });
    if (!user)
      res.json({
        status: false,
        message: "Email address or Password is in-correct"
      });
    else {
      req.login(user, function(err) {
        if (err) {
          res.status(500).json({ status: false, message: err });
        } else {
          delete user.Salt;
          delete user.Password;
          let token = checkAuth.signToken(user._id);
          res
            .status(200)
            .json({
              status: true,
              message: "Authentication successful",
              token: token,
              user: user
            });
        }
      });
    }
  })(req, res, next);
};

exports.loginFacebook = (req, res, next) => {
  passport.authenticate('facebook', { scope: 'email'})(req, res, next)
};

exports.callback= (req, res) => {
  return passport.authenticate('facebook', {
      successRedirect: '/profile',
      failureRedirect:'/failed'
  })(req, res)
};

