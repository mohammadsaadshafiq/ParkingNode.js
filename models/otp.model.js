const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const OTPSchema = new Schema({
    OTP: String,
    Expiration_time: Date,
    MobileNumber: String,
    Verified: Boolean,
    Action: String,
    UserID: { type: Schema.ObjectId }

}, { timestamps: true });

exports.getOTPModel = mongoose.model("OTP", OTPSchema);
