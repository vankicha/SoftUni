const Play = require('../models/Play');

async function getAll() {
    let result = await Play.find().lean();

    return result;
}

function getOne(id) {
    return Play.findById(id).lean();
}

function create(data, creator) {
    let { title, imageUrl, description, checkBox } = data;
    let isPublic = checkBox ? true : false;

    if (!title || !imageUrl || !description)
        throw { message: 'You can not have empty fields!' };

    let play = new Play({
        title,
        imageUrl,
        description,
        isPublic,
        creator,
        createdAt: new Date(),
    });

    return play.save();
}

function updateOne(productId, productData) {
    let { checkBox } = productData;
    let isPublic = checkBox ? true : false;

    return Play.updateOne({ _id: productId }, { ...productData, isPublic });
}

function updateCollection(productId, productData) {
    return Play.updateOne({ _id: productId }, productData);
}

function deleteOne(productId) {
    return Play.deleteOne({ _id: productId });
}

module.exports = {
    getAll,
    getOne,
    create,
    updateOne,
    deleteOne,
    updateCollection,
};
