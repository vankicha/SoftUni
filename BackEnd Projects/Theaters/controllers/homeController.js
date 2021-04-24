const { Router } = require('express');

const router = Router();

router.get('/', (req, res) => {
    res.redirect('/theaters');
    /* res.render('home'); */
});

/* router.get('/user', async (req, res) => {
    let user = await authService.getUserInfo(req.user._id);

    let { collection } = user;

    let cost = offers.reduce((a, x) => (a += x.price), 0);

    res.render('user', { collection });
}); */

/* router.get('/about', (req, res) => {
    res.render('about', { title: 'About' });
}); */

module.exports = router;
