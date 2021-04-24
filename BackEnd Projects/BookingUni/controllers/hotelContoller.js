const { Router } = require('express');
const productService = require('../services/productService');
const authService = require('../services/authService');

const isAuthenticated = require('../middlewares/isAuthenticated');

const router = Router();

router.get('/', async (req, res) => {
    let hotels = await productService.getAll();

    if (!req.user) {
        hotels = hotels
            .map(function (x) {
                return {
                    ...x,
                    freeRooms: x.freeRooms - x.bookedUsers.length,
                };
            })
            .sort((a, b) => b.freeRooms - a.freeRooms)
            .slice(0, 3);
    }

    res.render('home', { hotels });
});

router.get('/create', isAuthenticated, (req, res) => {
    res.render('create');
});

router.get('/details/:productId', isAuthenticated, async (req, res) => {
    let product = await productService.getOne(req.params.productId);

    let isCreator = product.creator === req.user?.username ? true : false;
    let isBooked = product.bookedUsers.find(
        (x) => x._id.toString() === req.user._id
    );

    res.render('details', {
        ...product,
        isCreator,
        isBooked,
    });
});

router.get('/:productId/edit', isAuthenticated, async (req, res) => {
    const { productId } = req.params;

    const product = await productService.getOne(productId);
    if (req.user.username !== product.creator) {
        return res.redirect(`/products/details/${productId}`);
    }

    res.render('edit', {
        ...product,
        currentFreeRooms: product.freeRooms - product.bookedUsers.length,
    });
});

router.get('/:productId/delete', isAuthenticated, async (req, res) => {
    const { productId } = req.params;

    const product = await productService.getOne(productId);

    if (req.user.username !== product.creator) {
        return res.redirect(`/products/details/${productId}`);
    }
    await productService.deleteOne(productId);
    res.redirect('/hotels');
});

router.get('/:productId/book', isAuthenticated, async (req, res) => {
    const { productId } = req.params;
    const product = await productService.getOne(productId);

    if (req.user.username === product.creator) {
        return res.redirect(`/hotels/details/${productId}`);
    }

    product.bookedUsers.push(req.user._id);

    await productService.updateOne(productId, product);
    await authService.updateBookedHotels(req.user.username, product._id);

    res.redirect(`/hotels/details/${productId}`);
});

router.post('/create', isAuthenticated, (req, res) => {
    productService
        .create(req.body, req.user.username)
        .then((hotel) => {
            authService.updateOfferedHotels(req.user.username, hotel._id);
            res.redirect('/hotels');
        })
        .catch((err) => {
            let error = err?.errors
                ? Object.keys(err.errors).map((x) => ({
                      message: err.errors[x].properties.message,
                  }))[0]
                : err;
            res.render('create', { error });
        });
});

router.post('/:productId/edit', isAuthenticated, async (req, res) => {
    const { productId } = req.params;

    const product = await productService.getOne(productId);

    if (req.user.username !== product.creator) {
        return res.redirect(`/products/details/${productId}`);
    }

    const productData = req.body;
    await productService.updateOne(productId, productData);
    res.redirect(`/hotels/details/${productId}`);
});

module.exports = router;
