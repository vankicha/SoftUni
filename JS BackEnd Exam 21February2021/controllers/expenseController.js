const { Router } = require('express');
const expenseService = require('../services/expenseService');
const authService = require('../services/authService');

const isAuthenticated = require('../middlewares/isAuthenticated');

const router = Router();

router.get('/', isAuthenticated, async (req, res) => {
    let { expenses } = await authService.getUserInfo(req.user._id);
    res.render('user-home', { expenses });
});

router.get('/create', isAuthenticated, (req, res) => {
    res.render('create');
});

router.get('/:expenseId/report', isAuthenticated, async (req, res) => {
    let expense = await expenseService.getOne(
        req.params.expenseId,
        req.user._id
    );

    res.render('report', {
        ...expense,
    });
});

router.get('/:expenseId/delete', isAuthenticated, async (req, res) => {
    const { expenseId } = req.params;

    await expenseService.deleteOne(expenseId);
    await authService.deleteOneFromCollection(req.user.username, expenseId);
    res.redirect('/expenses');
});

router.post('/create', isAuthenticated, async (req, res) => {
    try {
        let createdExpense = await expenseService.create(
            req.body,
            req.user._id
        );
        await authService.updateCollection(
            req.user.username,
            createdExpense._id
        );
        res.redirect('/expenses');
    } catch (err) {
        let error = err?.errors
            ? Object.keys(err.errors).map((x) => ({
                  message: err.errors[x].properties.message,
              }))[0]
            : err;
        res.render('create', { error });
    }
});

router.post('/refill', isAuthenticated, async (req, res) => {
    const amount = Number(req.body.amount);
    await authService.refill(req.user.username, amount);
    res.redirect('/expenses');
});

module.exports = router;
