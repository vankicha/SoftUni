const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Title is required'],
        unique: [true, 'Title should be unique'],
        minlength: [true, 'The title should be at least 4 characters'],
        /*  validate: {
            validator: function (value) {
                return /^[\w\s]+$/.test(value);
            },
            message: 'Name could contain only letters, digits and whitespaces',
        }, */
    },
    description: {
        type: String,
        required: [true, 'Decsription is required'],
        minlength: [
            20,
            'The description should be at least 20 characters long',
        ],
        maxlength: 50,
        /* validate: {
            validator: function (value) {
                return /^[\w\s]+$/.test(value);
            },
            message:
                'Description could contain only letters, digits and whitespaces',
        }, */
    },
    imageUrl: {
        type: String,
        required: [true, 'Link to image is required'],
        validate: {
            validator: function (value) {
                return /^https?/.test(value);
            },
            message: 'Your image address should refer to actual picture',
        },
    },
    duration: {
        type: String,
        required: [true, 'Duration is required'],
        /* min: 1,
        max: 6, */
    },
    createdAt: {
        type: Date,
        required: [true, 'Date is required'],
    },
    creator: {
        type: String,
    },
    enrolledUsers: [
        {
            type: mongoose.Types.ObjectId,
            ref: 'User',
        },
    ],
});

module.exports = mongoose.model('Product', productSchema);
