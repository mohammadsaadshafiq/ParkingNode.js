const otpGenerator = require('otp-generator')



exports.generateOTP = (otp_length) => {
    let OTP = otpGenerator.generate(otp_length, { upperCaseAlphabets: false, specialChars: false });
    return OTP;
};



exports.calculateOTPExpirationTime = () => {
    var minutesToAdd = 02;
    var currentDate = new Date();
    var futureDate = new Date(currentDate.getTime() + minutesToAdd * 60000);
    return futureDate
}


let otp_Actions = {
    USER_CREATION : "User Creation",
    FORGOT_PASSWORS : "Forgot Password"
}
exports.otp_Actions = otp_Actions; 

