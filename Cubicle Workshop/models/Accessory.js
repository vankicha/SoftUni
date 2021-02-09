const mongoose = require('mongoose');

const accessorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        minlength: [5, 'Name should be more than 5 characters long'],
        validate: {
            validator: function (value) {
                return /^[\w\s]+$/.test(value);
            },
            message: 'Name could contain only letters, digits and whitespaces',
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
});

module.exports = mongoose.model('Accessory', accessorySchema);
