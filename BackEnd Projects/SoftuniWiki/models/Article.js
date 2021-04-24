const mongoose = require('mongoose');

const articleSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Name is required'],
        unique: [true, 'Name should be unique'],
        minlength: [5, 'The name should be at least 5 characters'],
    },
    description: {
        type: String,
        required: [true, 'Decsription is required'],
        minlength: [
            20,
            'The description should be at least 20 characters long',
        ],
    },
    createdAt: {
        type: Date,
        required: [true, 'Date is required'],
        default: new Date(),
    },
    creatorId: {
        type: mongoose.Types.ObjectId,
        ref: 'User',
    },
});

module.exports = mongoose.model('Article', articleSchema);
