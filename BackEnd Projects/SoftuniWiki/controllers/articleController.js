const { Router } = require('express');
const articleService = require('../services/articleService');
const authService = require('../services/authService');

const isAuthenticated = require('../middlewares/isAuthenticated');
const isCreator = require('../middlewares/isCreator');

const router = Router();

router.get('/', async (req, res) => {
    let articles = await articleService.getAll();
    res.render('articles', { articles });
});

router.get('/create', isAuthenticated, (req, res) => {
    res.render('create');
});

router.get('/:articleId/details', async (req, res) => {
    let article = await articleService.getOne(
        req.params.articleId,
        req.user._id
    );

    /* let isCreator =
        article.creatorId.toString() === req.user?._id ? true : false; */

    res.render('details', {
        ...article,
    });
});

router.get('/:articleId/edit', isAuthenticated, async (req, res) => {
    const { articleId } = req.params;

    const article = await articleService.getOne(articleId);

    res.render('edit', {
        ...article,
    });
});

router.get('/:articleId/delete', isCreator, async (req, res) => {
    await articleService.deleteOne(req.params.articleId);
    res.redirect('/');
});

router.get('/:productId/temp', isAuthenticated, async (req, res) => {
    const { productId } = req.params;
    const product = await articleService.getOne(productId);

    if (req.user.username === product.creator) {
        return res.redirect(`/products/details/${productId}`);
    }

    product.collectionUsers.push(req.user._id);

    await articleService.updateOne(productId, product);
    await authService.updateCollection(req.user.username, product._id);

    res.redirect(`/products/details/${productId}`);
});

router.post('/create', isAuthenticated, (req, res) => {
    articleService
        .create(req.body, req.user._id)
        .then(() => res.redirect('/'))
        .catch((err) => {
            let error = err?.errors
                ? Object.keys(err.errors).map((x) => ({
                      message: err.errors[x].properties.message,
                  }))[0]
                : err;
            res.render('create', { error });
        });
});

router.post('/:articleId/edit', isAuthenticated, async (req, res) => {
    const { articleId } = req.params;

    const articleData = req.body;
    await articleService.updateOne(articleId, articleData);
    res.redirect(`/articles/${articleId}/details`);
});

module.exports = router;
