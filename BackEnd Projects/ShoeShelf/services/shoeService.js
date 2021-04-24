const Shoe = require('../models/Shoe');

async function getAll() {
    let result = await Shoe.find().sort({ buyers: -1 }).lean();
    return result;
}

async function getLatest(count, { search = '' }) {
    let result = await Shoe.find()
        .where({ title: { $regex: search, $options: 'i' } })
        .sort({ createdAt: -1 })
        .limit(count)
        .lean();

    return result;
}

async function getOne(id, { fullName, _id }) {
    let shoe = await Shoe.findById(id).lean();

    shoe.isCreator = shoe.creator === fullName ? true : false;
    shoe.isMatch = shoe.buyers.toString().includes(_id.toString());

    return shoe;
}

function create(data, creator) {
    let shoe = new Shoe({ ...data, creator, createdAt: new Date() });

    return shoe.save();
}

function updateOne(shoeId, shoeData) {
    return Shoe.updateOne({ _id: shoeId }, shoeData);
}

function deleteOne(productId) {
    return Shoe.deleteOne({ _id: productId });
}

module.exports = {
    getAll,
    getLatest,
    getOne,
    create,
    updateOne,
    deleteOne,
};
