const User = require('../models/User');
const jwt = require('jsonwebtoken');
const config = require('../config/config');

async function register({ username, password }) {
    let user = await User.findOne({ username });

    if (user) throw { message: 'User already exists!' };

    user = new User({ username, password });

    return user.save();
}

async function login({ username, password }) {
    let user = await User.findOne({ username });

    if (!user) throw { message: 'Wrong username or password' };

    let isMatch = password === user.password ? true : false;
    if (!isMatch) throw { message: 'Wrong username or password' };

    let token = jwt.sign(
        { _id: user._id, username: user.username },
        config.SECRET
    );

    return token;
}

async function updateCollection(username, productId) {
    let user = await User.findOne({ username });

    user.likedPlays.push(productId);

    return user.save();
}

async function getUserInfo(id) {
    let user = await User.findOne({ _id: id }).populate('collection').lean();

    return user;
}

module.exports = { register, login, updateCollection, getUserInfo };
