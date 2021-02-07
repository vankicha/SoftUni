const { Router } = require('express');
const authService = require('../services/authService');

const isGuest = require('../middlewares/isGuest');
const isAuthenticated = require('../middlewares/isAuthenticated');

const config = require('../config/config');

const router = Router();

router.get('/login', isGuest, (req, res) => {
    res.render('login', { title: 'Login' });
});

router.get('/register', isGuest, (req, res) => {
    res.render('register', { title: 'Register' });
});

router.post('/login', isGuest, async (req, res) => {
    let { username, password } = req.body;

    try {
        let token = await authService.login({ username, password });

        res.cookie(config.USER_SESSION, token);
        res.redirect('/products');
    } catch (error) {
        res.render('login', { error });
    }
});

router.post('/register', isGuest, async (req, res) => {
    let { username, password, repeatPassword } = req.body;

    try {
        if (password !== repeatPassword)
            throw { message: "Passwords don't match!" };

        let user = await authService.register({
            username,
            password,
        });

        res.redirect('/auth/login');
    } catch (error) {
        res.render('register', { error });
    }
});

router.get('/logout', isAuthenticated, (req, res) => {
    res.clearCookie(config.USER_SESSION);
    res.redirect('/products');
});

module.exports = router;
