const { Router } = require('express');
const { getAll, getOne, create } = require('../services/productService');

const router = Router();

router.get('/', (req, res) => {
    let products = getAll(req.query);
    res.render('home', { title: 'Browse', products });
});

router.get('/details/:productId', (req, res) => {
    let product = getOne(req.params.productId);
    res.render('details', { title: 'Details', ...product });
});

router.get('/create', (req, res) => {
    res.render('create', { title: 'Create' });
});

router.post('/create', (req, res) => {
    create(req.body)
    .then(() => res.redirect('/products'))
    .catch(() => res.status('404').end());
});

module.exports = router;

//RENDERS