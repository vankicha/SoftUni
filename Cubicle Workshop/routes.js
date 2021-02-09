const { Router } = require('express');

const productController = require('./controllers/productController');
const homeController = require('./controllers/homeController');
const accessoryController = require('./controllers/accessoryController');
const authController = require('./controllers/authController');

const isAuthenticated = require('./middlewares/isAuthenticated');

const router = Router();

router.use('/', homeController);
router.use('/products', productController);
router.use('/accessories', isAuthenticated, accessoryController);
router.use('/auth', authController);
router.get('*', (req, res) => {
    res.render('404');
});

module.exports = router;
