const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        unique: [true, 'Name should be unique'],
        minlength: [4, 'The name should be at least 4 characters long'],
        validate: {
            validator: function (value) {
                return /^[\w\s]+$/.test(value);
            },
            message: 'Name could contain only letters, digits and whitespaces',
        },
    },
    city: {
        type: String,
        required: [true, 'City is required'],
        minlength: [3, 'The city should be at least 3 characters long'],
    },
    freeRooms: {
        type: Number,
        min: [1, 'Free rooms should be number between 1 and 100'],
        max: [100, 'Free rooms should be number between 1 and 100'],
    },
    imageUrl: {
        type: String,
        required: [true, 'Link to image is required'],
        validate: {
            validator: function (value) {
                return /^https?/.test(value);
            },
            message: 'Your image url should refer to actual picture',
        },
    },
    creator: {
        type: String,
    },
    /* creatorId: {
        type: mongoose.Types.ObjectId,
        ref: 'User',
    }, */
    bookedUsers: [
        {
            type: mongoose.Types.ObjectId,
            ref: 'User',
        },
    ],
    /* description: {
        type: String,
        required: [true, 'Decsription is required'],
        minlength: [
            20,
            'The description should be at least 20 characters long',
        ],
        maxlength: [
            50,
            'The description should be lower than 50 characters long',
        ],
        validate: {
            validator: function (value) {
                return /^[\w\s]+$/.test(value);
            },
            message:
                'Description could contain only letters, digits and whitespaces',
        },
    }, */
    /* duration: {
        type: String,
        required: [true, 'Duration is required'],
    },
    createdAt: {
        type: Date,
        required: [true, 'Date is required'],
    }, */
});

module.exports = mongoose.model('Product', productSchema);
