const shoeService = require('../services/shoeService');

module.exports = async (req, res, next) => {
    const { shoeId } = req.params;

    const shoe = await shoeService.getOne(shoeId, req.user);

    if (!shoe.isCreator) {
        return res.redirect(`/shoes/${shoeId}/details`);
    }

    next();
};
