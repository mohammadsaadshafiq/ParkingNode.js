var express = require('express');
var router = express.Router();
var OTPController = require("../controllers/otp.controller");
const checkAuth = require('../middlewares/checkAuth').authMiddleware;



router.post("/send_otp", OTPController.send_otp);
router.post("/verify_otp", OTPController.verify_otp);


module.exports = router;
