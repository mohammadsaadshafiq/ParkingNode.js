const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;
const crypto = require("crypto");
const uuid = require("uuid");

const ActionDetails = {
  ActionTakenByName: { type: String },
  ActionTakenByID: { type: Schema.ObjectId },
  ActionTakenOn: { type: Date },
};


const UserSchema = new Schema({
  FirstName: String,
  LastName: String,
  MobileNumber: String,
  EmailID: String,
  Salt: { type: String, required: false, default: uuid.v1() }, //saad
  password: { type: String, required: false }, //saad
  StatusCode: Number, // 1 for active , 2 for delete
  LastUpdatedOn: Date,
  DeletionDetails: ActionDetails,
  ResetToken: String,
  IsMasterAdmin: { type: Boolean, default: false },
  OTPDetails : {
    OTP: String,
    Expiration_time: Date,
    Action: String
  }
  
},
  { timestamps: true }
);


// Non-sensitive info we'll be putting in the token
UserSchema.virtual("token").get(function () {
  return {
    _id: this._id,
    AccountType: this.AccountType
  };
});

var validatePresenceOf = function (value) {
  return value && value.length;
};

/**
 * Pre-save hook
 */
UserSchema.pre("save", function (next) {
  // Handle new/update passwords

  if (!this.isModified("password")) {
    return next();
  }

  if (!validatePresenceOf(this.password)) {
    return next(new Error("Invalid password"));
  }

  // Make Salt with a callback
  this.makeSalt((saltErr, Salt) => {
    if (saltErr) {
      return next(saltErr);
    }
    this.Salt = Salt;
    this.encryptPassword(this.password, (encryptErr, hashedPassword) => {
      if (encryptErr) {
        return next(encryptErr);
      }
      this.password = hashedPassword;
      next();
    });
  });
});

/**
 * Methods
 */
UserSchema.methods = {
  /**
   * Authenticate - check if the passwords are the same
   *
   * @param {String} password
   * @param {Function} callback
   * @return {Boolean}
   * @api public
   */
  authenticate(password, callback) {
    if (!callback) {
      return this.password === this.encryptPassword(password);
    }

    this.encryptPassword(password, (err, pwdGen) => {
      if (err) {
        console.log('Error in Encryption : ', err)
        return callback(err);
      }
      if (this.password === pwdGen) {
        console.log("With Call Back PWD Matched!");
        callback(null, true);
      } else {
        console.log("With Call Back PWD Does not Matched!");
        callback(null, false);
      }
    });
  },

  /**
   * Make Salt
   *
   * @param {Number} byteSize Optional Salt byte size, default to 16
   * @param {Function} callback
   * @return {String}
   * @api public
   */
  makeSalt(byteSize, callback) {
    console.log("Inside Salt Creation!!");
    var defaultByteSize = 16;

    if (typeof arguments[0] === "function") {
      callback = arguments[0];
      byteSize = defaultByteSize;
    } else if (typeof arguments[1] === "function") {
      callback = arguments[1];
    }

    if (!byteSize) {
      byteSize = defaultByteSize;
    }

    if (!callback) {
      return crypto.randomBytes(byteSize).toString("base64");
    }

    return crypto.randomBytes(byteSize, (err, Salt) => {
      if (err) {
        callback(err);
      } else {
        callback(null, Salt.toString("base64"));
      }
    });
  },

  /**
   * Encrypt password
   *
   * @param {String} password
   * @param {Function} callback
   * @return {String}
   * @api public
   */
  encryptPassword(password, callback) {
    if (!password || !this.Salt) {
      if (!callback) {
        return null;
      } else {
        return callback("Missing password or Salt");
      }
    }

    var defaultIterations = 10000;
    var defaultKeyLength = 64;
    var Salt = new Buffer(this.Salt, "base64");

    if (!callback) {
      return crypto
        .pbkdf2Sync(password, Salt, defaultIterations, defaultKeyLength)
        .toString("base64");
    }

    return crypto.pbkdf2(
      password,
      Salt,
      defaultIterations,
      defaultKeyLength,
      "sha1",
      (err, key) => {
        if (err) {
          callback(err);
        } else {
          callback(null, key.toString("base64"));
        }
      }
    );
  }
};

exports.getUserModel = mongoose.model("Users", UserSchema);
