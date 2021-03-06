const mongoose = require('mongoose');
const config = require('../config/config');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, 'Username is required'],
        unique: [true, 'Username should be unique'],
        minlength: [5, 'Username is too short'],
        validate: {
            validator: function (value) {
                return /^[\w]+$/.test(value);
            },
            message: 'Username must contains only letters and digits',
        },
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [5, 'Password is too short'],
        validate: {
            validator: function (value) {
                return /^[\w]+$/.test(value);
            },
            message: 'Password should consist only letters and digits',
        },
    },
    articles: [
        {
            type: mongoose.Types.ObjectId,
            ref: 'Article',
        },
    ],
});

userSchema.pre('save', function (next) {
    bcrypt
        .genSalt(config.SALT_ROUNDS)
        .then((salt) => {
            return bcrypt.hash(this.password, salt);
        })
        .then((hash) => {
            this.password = hash;
            next();
        })
        .catch((err) => {
            console.log(err);
        });
});

module.exports = mongoose.model('User', userSchema);
