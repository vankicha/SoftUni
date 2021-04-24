const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: [true, 'Email should be unique'],
        /* minlength: [3, 'Email should be more than 3 letters'], */
        validate: {
            validator: function (value) {
                return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(value);
            },
            message: 'Email must contains only English letters and digits',
        },
    },
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
    bookedHotels: [
        {
            type: mongoose.Types.ObjectId,
            ref: 'Product',
        },
    ],
    offeredHotels: [
        {
            type: mongoose.Types.ObjectId,
            ref: 'Product',
        },
    ],
});

module.exports = mongoose.model('User', userSchema);
