const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
    merchant: {
        type: String,
        required: [true, 'Merchant is required'],
        unique: [true, 'Merchant should be unique'],
        minlength: [4, 'The merchant should be at least 4 characters'],
    },
    total: {
        type: Number,
        required: [true, 'Total is required'],
    },
    category: {
        type: String,
        required: [true, 'Category is required'],
    },
    description: {
        type: String,
        required: [true, 'Decsription is required'],
        minlength: [3, 'The description should be at least 3 characters long'],
        maxlength: [
            30,
            'The description should be lower than 30 characters long',
        ],
    },
    report: {
        type: Boolean,
        required: [true, 'Report is required'],
        default: false,
    },
    creatorId: {
        type: mongoose.Types.ObjectId,
        ref: 'User',
    },
});

module.exports = mongoose.model('Expense', expenseSchema);
