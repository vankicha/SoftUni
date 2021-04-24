const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const config = require('../config/config');

async function register(email, fullName, password) {
    let user = await User.findOne({ email });

    if (user) throw { message: 'User already exists!' };

    user = new User({ email, fullName, password });

    return await user.save();
}

async function login(email, password) {
    let user = await User.findOne({ email });

    if (!user) throw { message: 'Wrong email or password' };

    let isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw { message: 'Wrong email or password' };
    let token = jwt.sign(
        { _id: user._id, fullName: user.fullName, email: user.email },
        config.SECRET
    );
    return token;
}

async function updateCollection(fullName, shoeId) {
    let user = await User.findOne({ fullName });

    user.shoesBought.push(shoeId);

    return User.updateOne({ fullName }, user);
}

async function getUserInfo(id) {
    let user = await User.findOne({ _id: id }).populate('shoesBought').lean();

    return user;
}

module.exports = { register, login, updateCollection, getUserInfo };
