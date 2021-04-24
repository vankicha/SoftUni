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
    let { email, password } = req.body;

    try {
        let token = await authService.login(email, password);

        res.cookie(config.USER_SESSION, token);
        res.redirect('/');
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
    let { email, fullName, password, repeatPassword } = req.body;

    try {
        if (password !== repeatPassword)
            throw { message: "Passwords don't match!" };
        let user = await authService.register(email, fullName, password);
        let token = await authService.login(email, password);
        res.cookie(config.USER_SESSION, token);
        res.redirect('/shoes');

        /* res.redirect('/auth/login'); */
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
    res.redirect('/auth/login');
});

module.exports = router;
