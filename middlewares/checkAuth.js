var Jwt = require('jsonwebtoken');
var repo = require('../repositories/user.repository');

exports.authMiddleware = function (req, res, next) {
    let token = req.get('Authorization');

    if (token) {
        token = token.split(' ');

        if (token.length > 1) {
            token = token[1];
        }
        else {
            return res.status(401).send({ status: false, message: "Not Authorized" });
        }
        var decoded = Jwt.verify(token, process.env.jwtKey);
        if (decoded._id) {
            let query = { _id: decoded._id };
            repo.FindUserFromDB(true, query).then(function (data) {
                if (data) {
                    req.user = data;
                    token = signToken(data._id);
                    res.set('auth_token', token);
                    next();
                } else {
                    res.status(401).send({ status: false, message: "Not Authorized" });
                }
            }, function (err) {
                res.status(401).send({ status: false, message: "Not Authorized", error: err });
            });
        }
    } else {
        res.status(401).send({ status: false, message: "Not Authorized" });
    }
}

function signToken(id) {
    let token = Jwt.sign({ _id: id.toString() }, process.env.jwtKey, { expiresIn: 900 });
    return token;
}

exports.signToken = signToken;