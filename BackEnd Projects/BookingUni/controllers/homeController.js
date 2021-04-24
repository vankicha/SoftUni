const { Router } = require('express');
const authService = require('../services/authService');

const router = Router();

router.get('/', (req, res) => {
    res.redirect('/hotels');
    /* res.render('home'); */
});

router.get('/user', async (req, res) => {
    let user = await authService.getUserInfo(req.user._id);

    console.log(user);
    res.render('user', { ...user });
});

/* router.get('/about', (req, res) => {
    res.render('about', { title: 'About' });
}); */

module.exports = router;

//RENDERS
