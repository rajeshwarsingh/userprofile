const mongoose = require("mongoose");
const bcrypt = require('bcrypt-nodejs');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    "name": String,
    "email": String,
    "image": String,
    "password": String
});

// Execute before each user save call
userSchema.pre('save', function(callback) {
    let user = this;

    if (!user.isModified('password')) return callback();

    // Password changed so we need to hash it
    bcrypt.genSalt(5, function(err, salt) {
        if (err) return callback(err);

        bcrypt.hash(user.password, salt, null, function(err, hash) {
            if (err) return callback(err);
            user.password = hash;
            callback();
        });
    });
});

let userModel = mongoose.model("users", userSchema)

module.exports = {
    userModel
}
