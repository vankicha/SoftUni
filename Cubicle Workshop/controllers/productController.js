const { Router } = require('express');
const productService = require('../services/productService');
const accessoryService = require('../services/accessoryService');

const router = Router();

router.get('/', async (req, res) => {
    let products = await productService.getAll(req.query);
    res.render('home', { title: 'Browse', products });
});

router.get('/details/:productId', async (req, res) => {
    let product = await productService.getOneWithAccessories(req.params.productId);
    res.render('details', { title: 'Details', ...product });
});

router.get('/create', (req, res) => {
    res.render('create', { title: 'Create' });
});

router.get('/:productId/attach', async (req, res) => {
    const { productId } = req.params;
    const product = await productService.getOne(productId);
    const accessories = await accessoryService.getAllAvailable(product.accessories);

    res.render('attachAccessory', { title: 'Attach accessory', product, accessories });
});

router.post('/create', (req, res) => {
    productService.create(req.body)
    .then(() => res.redirect('/products'))
    .catch(() => res.status('404').end());
});

router.post('/:productId/attach', async (req, res) => {
    let productId = req.params.productId;
    let accessoryId = req.body.accessory;
    
    await productService.attachAccessory(productId, accessoryId);

    res.redirect(`/products/details/${productId}`);
});

module.exports = router;