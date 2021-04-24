const { Router } = require('express');
const authService = require('../services/authService');

const router = Router();

router.get('/', (req, res) => {
    res.redirect('/shoes');
});

router.get('/user', async (req, res) => {
    let user = await authService.getUserInfo(req.user._id);

    let { shoesBought } = user;

    let cost = shoesBought.reduce((a, x) => (a += x.price), 0);

    res.render('profile', { shoesBought, cost });
});

/* router.get('/about', (req, res) => {
    res.render('about', { title: 'About' });
}); */

module.exports = router;
