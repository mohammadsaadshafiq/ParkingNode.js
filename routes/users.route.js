var express = require('express');
var router = express.Router();
var userController = require("../controllers/user.controller");
const checkAuth = require('../middlewares/checkAuth').authMiddleware;




router.post("/login", userController.login);
router.post("/createUser", userController.createUser);
router.get("/auth/facebook",userController.loginFacebook)
router.get('/facebook/callback',userController.callback),
module.exports = router;
