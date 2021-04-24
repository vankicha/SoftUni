const articleService = require('../services/articleService');

module.exports = async (req, res, next) => {
    const { articleId } = req.params;

    const article = await articleService.getOne(articleId);

    if (req.user._id !== article.creatorId.toString()) {
        return res.redirect(`/articles/${articleId}/details`);
    }

    next();
};
