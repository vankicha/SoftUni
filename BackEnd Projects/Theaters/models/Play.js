const mongoose = require('mongoose');

const playSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Name is required'],
        unique: [true, 'Name should be unique'],
    },
    description: {
        type: String,
        required: [true, 'Decsription is required'],
        maxlength: [
            50,
            'The description should be lower than 50 characters long',
        ],
    },
    imageUrl: {
        type: String,
        required: [true, 'Link to image is required'],
    },
    isPublic: {
        type: Boolean,
        default: false,
    },
    createdAt: {
        type: Date,
        required: [true, 'Date is required'],
        likedUsers: [
            {
                type: mongoose.Types.ObjectId,
                ref: 'User',
            },
        ],
    },
    creator: {
        type: String,
    },
    likedUsers: [
        {
            type: mongoose.Types.ObjectId,
            ref: 'User',
        },
    ],
});

module.exports = mongoose.model('Play', playSchema);
