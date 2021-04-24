const Product = require('../models/Product');

async function getAll() {
    let result = await Product.find().lean();

    return result;
}

function getOne(id) {
    return Product.findById(id).lean();
}

function create(data, creator) {
    let product = new Product({ ...data, creator, createdAt: new Date() });

    return product.save();
}

function updateOne(productId, productData) {
    return Product.updateOne({ _id: productId }, productData);
}

function deleteOne(productId) {
    return Product.deleteOne({ _id: productId });
}

module.exports = {
    getAll,
    getOne,
    create,
    updateOne,
    deleteOne,
};
