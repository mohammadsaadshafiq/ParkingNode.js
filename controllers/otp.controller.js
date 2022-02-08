
const { generateOTP, calculateOTPExpirationTime } = require("../utils/otp.util");
const UserRepo = require("../repositories/user.repository");
const OTPRepo = require("../repositories/otp.repository");
const checkAuth = require("../middlewares/checkAuth");
const { otp_Actions } = require("../utils/otp.util");



exports.send_otp = async (req, res) => {
    try {
        const { Action, UserID } = req.body;
        let user_query = { _id: UserID };

        const user = await UserRepo.FindUserFromDB(true, user_query);
        if (!user) {
            res.json({ status: false, message: "User not found" });
            return;
        }

        let OTP_Details = {
            OTP: generateOTP(6),
            Expiration_time: calculateOTPExpirationTime(),
            Action: Action,
            MobileNumber: user.MobileNumber,
            UserID: UserID
        }

        let OTP_obj = { $set: { OTPDetails: OTP_Details } };
        await OTPRepo.SaveNewOTPInDB(OTP_Details);
        await UserRepo.UpdateUserInDB(user_query, OTP_obj);
        res.status(200).json({ status: true, OTP_Details: OTP_Details, message: "OTP sended to mobile number" });
    } catch (error) {
        res.status(500).json({ status: false, error: error });
    }
};

exports.verify_otp = async (req, res) => {
    try {
        const { otp, Action, UserID } = req.body;
        let user_query = { _id: UserID };
        let otp_query = { UserID: UserID, OTP: otp };

        let OTP_obj = {};
        let User_obj = {};
        let token = "";

        const user = await UserRepo.FindUserFromDB(true, user_query);
        if (!user) {
            res.json({ status: false, message: "User not found" });
            return;
        }
        if (user.OTPDetails?.OTP !== otp) {
            res.status(500).json({ status: false, message: 'Incorrect OTP' });
            return;
        }
        if (Action == otp_Actions.USER_CREATION) {
            User_obj = { $unset: { "OTPDetails": "" }, $set: { StatusCode: 1 } };
            token = checkAuth.signToken(user._id);
        }
        else {
            User_obj = { $unset: { "OTPDetails": "" } };
        }

        OTP_obj = { $set: { "Verified": true } };
        await UserRepo.UpdateUserInDB(user_query, User_obj);
        await OTPRepo.UpdateOTPInDB(otp_query, OTP_obj);

        res.status(200).json({
            status: true,
            message: "OTP verified successfully",
            token: token,
            user: user
        });

    } catch (error) {
        res.status(500).json({ status: false, error: error });
    }
}