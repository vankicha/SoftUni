const { Router } = require('express');
const productService = require('../services/productService');
const authService = require('../services/authService');

const isAuthenticated = require('../middlewares/isAuthenticated');

const router = Router();

router.get('/', async (req, res) => {
    let products = await productService.getAll();

    if (!req.user) {
        courses = products.sort(
            (a, b) => b.enrolledUsers.length - a.enrolledUsers.length
        );
        res.render('guest-home', { courses });
    } else {
        if (req.query?.search) {
            products = products.filter((x) =>
                x.title.toLowerCase().includes(req.query.search)
            );
        }

        courses = products.sort((a, b) => a.createdAt - b.createdAt);
        res.render('user-home', { courses });
    }
});

router.get('/details/:productId', isAuthenticated, async (req, res) => {
    let product = await productService.getOne(req.params.productId);

    let isCreator = product.creator === req.user?.username ? true : false;
    let isEnrolled = product.enrolledUsers.find(
        (x) => x._id.toString() === req.user._id
    );

    res.render('details', {
        ...product,
        isCreator,
        isEnrolled,
    });
});

router.get('/create', isAuthenticated, (req, res) => {
    res.render('create');
});


router.get('/:productId/edit', isAuthenticated, async (req, res) => {
    const { productId } = req.params;

    const product = await productService.getOne(productId);
    if (req.user.username !== product.creator) {
        return res.redirect(`/products/details/${productId}`);
    }

    res.render('edit', {
        ...product,
    });
});

router.get('/:productId/delete', isAuthenticated, async (req, res) => {
    const { productId } = req.params;

    const product = await productService.getOne(productId);

    if (req.user.username !== product.creator) {
        return res.redirect(`/products/details/${productId}`);
    }
    await productService.deleteOne(productId);
    res.redirect('/products');
});

router.get('/:productId/enroll', isAuthenticated, async (req, res) => {
    const { productId } = req.params;
    const product = await productService.getOne(productId);

    if (req.user.username === product.creator) {
        return res.redirect(`/products/details/${productId}`);
    }

    product.enrolledUsers.push(req.user._id);

    await productService.updateOne(productId, product);
    await authService.updateCourses(req.user.username, product._id);

    res.redirect(`/products/details/${productId}`);
});

router.post('/:productId/edit', isAuthenticated, async (req, res) => {
    const { productId } = req.params;

    const product = await productService.getOne(productId);

    if (req.user.username !== product.creator) {
        return res.redirect(`/products/details/${productId}`);
    }

    const productData = req.body;
    await productService.updateOne(productId, productData);
    res.redirect(`/products/details/${productId}`);
});


router.post('/create', isAuthenticated, (req, res) => {
    productService
        .create(req.body, req.user.username)
        .then(() => res.redirect('/products'))
        .catch((err) => {
            let error = err?.errors
                ? Object.keys(err.errors).map((x) => ({
                      message: err.errors[x].properties.message,
                  }))[0]
                : err;
            res.render('create', { error });
        });
});

module.exports = router;
