const { Router } = require('express');
const playService = require('../services/playService');
const authService = require('../services/authService');

const isAuthenticated = require('../middlewares/isAuthenticated');

const router = Router();

router.get('/', async (req, res) => {
    let plays = await playService.getAll();

    if (!req.user) {
        plays = plays
            .sort((a, b) => b.likedUsers.length - a.likedUsers.length)
            .slice(0, 3);
        res.render('guest-home', {
            plays,
        });
    } else {
        plays = plays.sort((a, b) => b.createdAt - a.createdAt);
        res.render('user-home', {
            plays,
        });
    }
});

router.get('/likesSorted', isAuthenticated, async (req, res) => {
    let plays = await playService.getAll();
    
    plays = plays.sort((a, b) => b.likedUsers.length - a.likedUsers.length);
    res.render('user-home', {
        plays,
    });
});

router.get('/create', isAuthenticated, (req, res) => {
    res.render('create');
});

router.get('/details/:productId', isAuthenticated, async (req, res) => {
    let play = await playService.getOne(req.params.productId);

    let isCreator = play.creator === req.user?.username ? true : false;
    let isLiked = play.likedUsers.find(
        (x) => x._id.toString() === req.user._id
    );

    res.render('details', {
        ...play,
        isCreator,
        isLiked,
    });
});

router.get('/:productId/edit', isAuthenticated, async (req, res) => {
    const { productId } = req.params;

    const product = await playService.getOne(productId);
    if (req.user.username !== product.creator) {
        return res.redirect(`/products/details/${productId}`);
    }

    res.render('edit', {
        ...product,
    });
});

router.get('/:productId/delete', isAuthenticated, async (req, res) => {
    const { productId } = req.params;

    const product = await playService.getOne(productId);

    if (req.user.username !== product.creator) {
        return res.redirect(`/products/details/${productId}`);
    }
    await playService.deleteOne(productId);
    res.redirect('/theaters');
});

router.get('/:productId/like', isAuthenticated, async (req, res) => {
    const { productId } = req.params;
    const play = await playService.getOne(productId);

    if (req.user.username === play.creator) {
        return res.redirect(`/theaters/details/${productId}`);
    }

    play.likedUsers.push(req.user._id);

    await playService.updateCollection(productId, play);
    await authService.updateCollection(req.user.username, play._id);

    res.redirect(`/theaters/details/${productId}`);
});

router.post('/create', isAuthenticated, async (req, res) => {
    try {
        await playService.create(req.body, req.user.username);
        res.redirect('/theaters');
    } catch (err) {
        let error = err?.errors
            ? Object.keys(err.errors).map((x) => ({
                  message: err.errors[x].properties.message,
              }))[0]
            : err;
        res.render('create', { error });
    }
});

router.post('/:productId/edit', isAuthenticated, async (req, res) => {
    const { productId } = req.params;

    const play = await playService.getOne(productId);

    if (req.user.username !== play.creator) {
        return res.redirect(`/products/details/${productId}`);
    }

    const playData = req.body;
    await playService.updateOne(productId, playData);
    res.redirect(`/theaters/details/${productId}`);
});

module.exports = router;
