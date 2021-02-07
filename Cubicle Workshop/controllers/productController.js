const { Router } = require('express');
const productService = require('../services/productService');
const accessoryService = require('../services/accessoryService');

const isGuest = require('../middlewares/isGuest');
const isAuthenticated = require('../middlewares/isAuthenticated');

const router = Router();

router.get('/', async (req, res) => {
    let products = await productService.getAll(req.query);
    res.render('home', { title: 'Browse', products });
});

router.get('/details/:productId', async (req, res) => {
    let product = await productService.getOneWithAccessories(
        req.params.productId
    );
    res.render('details', { title: 'Details', ...product });
});

router.get('/create', isAuthenticated, (req, res) => {
    res.render('create', { title: 'Create' });
});

router.get('/:productId/attach', isAuthenticated, async (req, res) => {
    const { productId } = req.params;
    const product = await productService.getOne(productId);
    const accessories = await accessoryService.getAllAvailable(
        product.accessories
    );

    res.render('attachAccessory', {
        title: 'Attach accessory',
        ...product,
        accessories,
    });
});

router.get('/:productId/edit', isAuthenticated, async (req, res) => {
    const { productId } = req.params;
    const product = await productService.getOne(productId);

    res.render('edit', {
        title: 'Edit',
        ...product,
    });
});

router.get('/:productId/delete', isAuthenticated, async (req, res) => {
    const { productId } = req.params;
    const product = await productService.getOne(productId);

    res.render('delete', {
        title: 'Delete Cube',
        ...product,
    });
});

router.post('/:productId/edit', isAuthenticated, async (req, res) => {
    const { productId } = req.params;
    const productData = req.body;
    await productService.updateOne(productId, productData);
    res.redirect(`/products/details/${productId}`);
});

router.post('/:productId/delete', isAuthenticated, async (req, res) => {
    const { productId } = req.params;
    await productService.deleteOne(productId);
    res.redirect('/products');
});

router.post('/create', isAuthenticated, (req, res) => {
    productService
        .create(req.body)
        .then(() => res.redirect('/products'))
        .catch(() => res.status('404').end());
});

router.post('/:productId/attach', isAuthenticated, async (req, res) => {
    let productId = req.params.productId;
    let accessoryId = req.body.accessory;

    await productService.attachAccessory(productId, accessoryId);

    res.redirect(`/products/details/${productId}`);
});

module.exports = router;
