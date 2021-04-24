const { Router } = require('express');
const authService = require('../services/authService');
const isAuthenticated = require('../middlewares/isAuthenticated');

const router = Router();

router.get('/', (req, res) => {
    if (req.user) {
        res.redirect('/expenses');
    } else {
        res.render('guest-home');
    }
});

router.get('/user', isAuthenticated, async (req, res) => {
    let user = await authService.getUserInfo(req.user._id);

    let { expenses } = user;

    let totalCost = expenses.reduce((a, x) => (a += x.total), 0);

    res.render('user', { expenses, totalCost, amount: user.amount });
});

module.exports = router;
