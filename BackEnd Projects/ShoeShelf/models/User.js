const mongoose = require('mongoose');
const config = require('../config/config');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: [true, 'Email should be unique'],
        minlength: [3, 'Email should be more than 3 letters'],
        validate: {
            validator: function (value) {
                return /^^[\w@\.\w\.\w]+$/.test(value);
            },
            message: 'Email must contains only English letters and digits',
        },
    },
    fullName: {
        type: String,
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [3, 'Password is too short'],
        validate: {
            validator: function (value) {
                return /^[\w]+$/.test(value);
            },
            message: 'Password should consist only letters and digits',
        },
    },
    shoesBought: [
        {
            type: mongoose.Types.ObjectId,
            ref: 'Shoe',
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
