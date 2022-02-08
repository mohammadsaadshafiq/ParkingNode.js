"use strict";
var _ = require("lodash");
const mongoose = require("mongoose");

require('dotenv').config();

let dburl = process.env.dburl;
let opts = { useNewUrlParser: true };
if (process.env.dbUser) {
    opts.user = process.env.dbUser;
}
if (process.env.dbpass) {
    opts.pass = process.env.dbpass
}

mongoose.connect(dburl, opts, function (err, db) {
    if (err) {
        console.log("Can not connect to DB");
        console.log(err);
    } else {
        console.log("Connected to DB");
    }
});

let con = mongoose.connection;

con.on("connecting", () => {
    console.log("Connecting on mongodb Server! : ", dburl);
});

con.on("connected", () => {
    console.log("connected on mongodb Server! : ", dburl);
});

con.on("open", () => {
    console.log("open connection called on mongodb Server! : ", dburl);
});

con.on("disconnecting", () => {
    console.log("disconnecting connection called on mongodb Server! : ", dburl);
});

con.on("disconnected", () => {
    console.log("disconnected connection called on mongodb Server! : ", dburl);
});

con.on("close", () => {
    console.log("close connection called on mongodb Server! : ", dburl);
});

con.on("reconnected", () => {
    console.log("reconnected connection called on mongodb Server! : ", dburl);
});

con.on("error", () => {
    console.log("error connection called on mongodb Server! : ", dburl);
});

con.on("fullsetup", () => {
    console.log("fullsetup called on mongodb Server! : ", dburl);
});

con.on("all", () => {
    console.log("all connection called on mongodb Server! : ", dburl);
});


/*Redis server*/
var session = require('express-session');
var RedisStore = require('connect-redis')(session);
var redis = "";
redis = require("redis").createClient();

redis.on("error", (error) => {
    console.error(error);
});

exports.Redis = {
    RedisStore: RedisStore,
    RedisClient: redis
};