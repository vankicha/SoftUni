const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        minlength: 5,
        validate: {
            validator: function (value) {
                return /^[\w]+$/.test(value);
            },
            message: 'Username must contains only letters and digits',
        },
    },
    password: {
        type: String,
        required: true,
        minlength: 8,
        validate: {
            validator: function (value) {
                return /^[\w]+$/.test(value);
            },
            message: 'Password should consist only letters and digits',
        },
    },
});

module.exports = mongoose.model('User', userSchema);
