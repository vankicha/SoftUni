const { Router } = require('express');
const productService = require('../services/productService');

const router = Router();

router.get('/', async (req, res) => {
    let products = await productService.getAll(req.query);
    res.render('home', { title: 'Browse', products });
});

router.get('/details/:productId', async (req, res) => {
    let product = await productService.getOne(req.params.productId);
    res.render('details', { title: 'Details', ...product });
});

router.get('/create', (req, res) => {
    res.render('create', { title: 'Create' });
});

router.post('/create', (req, res) => {
    productService.create(req.body)
    .then(() => res.redirect('/products'))
    .catch(() => res.status('404').end());
});

module.exports = router;

//RENDERS