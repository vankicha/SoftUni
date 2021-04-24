const { Router } = require('express');
const articleService = require('../services/articleService');

const router = Router();

router.get('/', async (req, res) => {
    let latestArticles = await articleService.getLatest(3, req.query);

    latestArticles = latestArticles.map((x) => ({
        ...x,
        description: x.description
            .split(' ')
            .slice(0, 50)
            .join(' ')
            .concat('...'),
    }));

    res.render('home', { latestArticles });
});

router.get('/user', async (req, res) => {
    let user = await authService.getUserInfo(req.user._id);

    let { collection } = user;

    /* let cost = offers.reduce((a, x) => (a += x.price), 0); */

    res.render('user', { collection });
});

/* router.get('/about', (req, res) => {
    res.render('about', { title: 'About' });
}); */

module.exports = router;
