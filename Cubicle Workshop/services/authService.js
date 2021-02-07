const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const config = require('../config/config');

async function register({ username, password }) {
    let user = await User.findOne({ username });

    if (user) throw { message: 'User already exists!' };

    let salt = await bcrypt.genSalt(config.SALT_ROUNDS);
    let hash = await bcrypt.hash(password, salt);
    user = new User({ username, password: hash });

    return user.save();
}

async function login({ username, password }) {
    let user = await User.findOne({ username });

    if (!user) throw { message: 'Wrong username or password' };

    let isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw { message: 'Wrong username or password' };

    let token = jwt.sign(
        { _id: user._id, username: user.username },
        config.SECRET
    );

    return token;
}

module.exports = { register, login };
