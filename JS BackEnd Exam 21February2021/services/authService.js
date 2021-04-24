const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const config = require('../config/config');

async function register(username, password, amount) {
    let user = await User.findOne({ username });

    if (user) throw { message: 'User already exists!' };

    user = new User({ username, password, amount });

    return user.save();
}

async function login(username, password) {
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

async function updateCollection(username, expenseId) {
    let user = await User.findOne({ username });
    user.expenses.push(expenseId);
    return User.updateOne({ username }, { expenses: user.expenses });
}

async function deleteOneFromCollection(username, expenseId) {
    let user = await User.findOne({ username });
    user.expenses = user.expenses.filter(
        (x) => x.toString() !== expenseId.toString()
    );
    return User.updateOne({ username }, { expenses: user.expenses });
}

async function getUserInfo(id) {
    let user = await User.findOne({ _id: id }).populate('expenses').lean();
    return user;
}

async function refill(username, amount) {
    let user = await User.findOne({ username });

    user.amount += amount;

    return User.updateOne({ username }, { amount: user.amount });
}

module.exports = {
    register,
    login,
    updateCollection,
    deleteOneFromCollection,
    getUserInfo,
    refill,
};
