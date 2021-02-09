const { Router } = require('express');
const accessoryService = require('../services/accessoryService');

const router = Router();

router.get('/create', (req, res) => {
    res.render('createAccessory', { title: 'Create Accessory' });
});

router.post('/create', async (req, res) => {
    accessoryService
        .create(req.body)
        .then(() => res.redirect('/products'))
        .catch((err) => {
            let errors = Object.keys(err.errors).map((x) => ({
                message: err.errors[x].properties.message,
            }));

            res.render('createAccessory', {
                error: errors[0],
            });
        });
});

module.exports = router;
