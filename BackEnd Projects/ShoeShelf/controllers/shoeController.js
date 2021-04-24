const { Router } = require('express');
const shoeService = require('../services/shoeService');
const authService = require('../services/authService');

const isAuthenticated = require('../middlewares/isAuthenticated');
const isCreator = require('../middlewares/isCreator');

const router = Router();

router.get('/', async (req, res) => {
    let shoes = await shoeService.getAll();

    if (!req.user) {
        res.render('guest-home', {});
    } else {
        shoes = shoes.sort((a, b) => b.buyers.length - a.buyers.length);
        res.render('user-home', {
            shoes,
        });
    }
});

router.get('/create', isAuthenticated, (req, res) => {
    res.render('create');
});

router.get('/:shoeId/details', isAuthenticated, async (req, res) => {
    let shoe = await shoeService.getOne(req.params.shoeId, req.user);

    res.render('details', {
        ...shoe,
    });
});

router.get('/:shoeId/edit', isCreator, async (req, res) => {
    const { shoeId } = req.params;

    const shoe = await shoeService.getOne(shoeId, req.user);

    res.render('edit', {
        ...shoe,
    });
});

router.get('/:shoeId/delete', isCreator, async (req, res) => {
    const { shoeId } = req.params;
    await shoeService.deleteOne(shoeId);
    res.redirect('/shoes');
});

router.get('/:shoeId/buy', isAuthenticated, async (req, res) => {
    const { shoeId } = req.params;
    const shoe = await shoeService.getOne(shoeId, req.user);

    if (shoe.isCreator) {
        return res.redirect(`/shoes/details/${productId}`);
    }

    if (shoe.isMatch) {
        return res.redirect(`/shoes/details/${productId}`);
    }

    shoe.buyers.push(req.user._id);

    await shoeService.updateOne(shoeId, shoe);
    await authService.updateCollection(req.user.fullName, shoe._id);

    res.redirect(`/shoes/${shoeId}/details`);
});

router.post('/create', isAuthenticated, async (req, res) => {
    try {
        checkFields(req.body);
        await shoeService.create(req.body, req.user.fullName);
        res.redirect('/shoes');
    } catch (err) {
        let error = err?.errors
            ? Object.keys(err.errors).map((x) => ({
                  message: err.errors[x].properties.message,
              }))[0]
            : err;
        res.render('create', { error });
    }
});

router.post('/:shoeId/edit', isCreator, async (req, res) => {
    const { shoeId } = req.params;
    const shoeData = req.body;
    try {
        checkFields(shoeData);
        await shoeService.updateOne(shoeId, shoeData);
        res.redirect(`/shoes/${shoeId}/details`);
    } catch (err) {
        let error = err?.errors
            ? Object.keys(err.errors).map((x) => ({
                  message: err.errors[x].properties.message,
              }))[0]
            : err;
        res.render('edit', { error });
    }
});

function checkFields(data) {
    const { name, price, imageUrl } = data;

    if (!name || !price || !imageUrl) {
        throw { message: 'Input fields should not be empty' };
    }
}

module.exports = router;
