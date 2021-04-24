const mongoose = require('mongoose');

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
    enrolledCourses: [
        {
            type: mongoose.Types.ObjectId,
            ref: 'Course',
        },
    ],
});

module.exports = mongoose.model('User', userSchema);
