const Cube = require('../models/Cube');
const Accessory = require('../models/Accessory');

async function getAll({ search, from, to }) {
    let result = await Cube.find().lean();

    return result;
}

function getOne(id) {
    return Cube.findById(id).lean();
}

async function getOneWithAccessories(id) {
    return Cube
        .findById(id)
        .populate('accessories')
        .lean();
}

function create(data) {
    let cube = new Cube(data);

    return cube.save();
}

async function attachAccessory(productId, accessoryId) {
    let product = await Cube.findById(productId);
    let accessory = await Accessory.findById(accessoryId);

    product.accessories.push(accessory);

    return product.save();
}

module.exports = {
    getAll,
    getOne,
    getOneWithAccessories,
    create,
    attachAccessory
}

//BUSSINES LOGIC