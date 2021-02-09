const mongoose = require('mongoose');

const cubeSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        validate: {
            validator: function (value) {
                return /^[\w\s]+$/.test(value);
            },
            message: 'Name could contain only letters, digits and whitespaces',
        },
    },
    description: {
        type: String,
        required: true,
        minlength: 20,
        validate: {
            validator: function (value) {
                return /^[\w\s]+$/.test(value);
            },
            message:
                'Description could contain only letters, digits and whitespaces',
        },
    },
    imageUrl: {
        type: String,
        required: true,
        validate: {
            validator: function (value) {
                return /^https?/.test(value);
            },
            message: 'Your image address should refer to actual picture',
        },
    },
    difficultyLevel: {
        type: Number,
        required: true,
        min: 1,
        max: 6,
    },
    accessories: [
        {
            type: mongoose.Types.ObjectId,
            ref: 'Accessory',
        },
    ],
    creatorId: {
        type: mongoose.Types.ObjectId,
        ref: 'User',
    },
});

module.exports = mongoose.model('Cube', cubeSchema);
