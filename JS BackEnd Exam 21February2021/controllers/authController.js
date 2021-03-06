const { Router } = require('express');
const authService = require('../services/authService');

const isGuest = require('../middlewares/isGuest');
const isAuthenticated = require('../middlewares/isAuthenticated');

const config = require('../config/config');

const router = Router();

router.get('/login', isGuest, (req, res) => {
    res.render('login');
});

router.get('/register', isGuest, (req, res) => {
    res.render('register');
});

router.post('/login', isGuest, async (req, res) => {
    let { username, password } = req.body;

    try {
        let token = await authService.login(username, password);

        res.cookie(config.USER_SESSION, token);
        res.redirect('/expenses');
    } catch (err) {
        let error = err?.errors
            ? Object.keys(err.errors).map((x) => ({
                  message: err.errors[x].properties.message,
              }))[0]
            : err;
        res.render('login', { error });
    }
});

router.post('/register', isGuest, async (req, res) => {
    let { username, password, repeatPassword, amount } = req.body;

    try {
        if (password !== repeatPassword)
            throw { message: "Passwords don't match!" };

        if (Number(amount) < 0) {
            throw { message: 'Amount should be positive number' };
        }
        let user = await authService.register(
            username,
            password,
            Number(amount)
        );

        let token = await authService.login(username, password);
        res.cookie(config.USER_SESSION, token);
        res.redirect('/expenses');
    } catch (err) {
        let error = err?.errors
            ? Object.keys(err.errors).map((x) => ({
                  message: err.errors[x].properties.message,
              }))[0]
            : err;
        res.render('register', { error });
    }
});

router.get('/logout', isAuthenticated, (req, res) => {
    res.clearCookie(config.USER_SESSION);
    res.redirect('/');
});

module.exports = router;
