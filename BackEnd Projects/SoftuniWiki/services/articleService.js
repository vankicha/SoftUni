const Article = require('../models/Article');

async function getAll() {
    let result = await Article.find().lean();

    return result;
}

async function getLatest(count, { search = '' }) {
    let result = await Article.find()
        .where({ title: { $regex: search, $options: 'i' } })
        .sort({ createdAt: -1 })
        .limit(count)
        .lean();

    return result;
}

async function getOne(id, userId) {
    let article = await Article.findById(id).lean();
    
    article.isCreator = article.creatorId.toString() === userId ? true : false;
    /* article.isMatch = article.find((x) => x.collection.includes(userId)); */

    return article;
}

function create(data, creatorId) {
    let article = new Article({ ...data, creatorId });

    return article.save();
}

function updateOne(productId, productData) {
    return Article.updateOne({ _id: productId }, productData);
}

function deleteOne(productId) {
    return Article.deleteOne({ _id: productId });
}

module.exports = {
    getAll,
    getLatest,
    getOne,
    create,
    updateOne,
    deleteOne,
};
