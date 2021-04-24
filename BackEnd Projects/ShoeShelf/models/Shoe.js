const mongoose = require('mongoose');

const shoeSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        unique: [true, 'Name should be unique'],
    },
    price: {
        type: Number,
        required: true,
        min: [0, 'Min value is 0'],
    },
    imageUrl: {
        type: String,
        required: [true, 'Link to image is required'],
    },
    description: {
        type: String,
    },
    brand: {
        type: String,
    },
    createdAt: {
        type: Date,
        required: [true, 'Date is required'],
    },
    creator: {
        type: String,
    },
    buyers: [
        {
            type: mongoose.Types.ObjectId,
            ref: 'User',
        },
    ],
});

module.exports = mongoose.model('Shoe', shoeSchema);
