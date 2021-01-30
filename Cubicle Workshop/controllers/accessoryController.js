const { Router } = require('express');
const accessoryService = require('../services/accessoryService');

const router = Router();

router.get('/create', (req, res) => {
    res.render('createAccessory', {title: 'Create Accessory'});
});

router.post('/create', async (req, res) => {
    accessoryService.create(req.body)
        .then(() => res.redirect('/products'))
        .catch(() => res.status('404').end());
});

module.exports = router;