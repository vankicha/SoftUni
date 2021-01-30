const Accessory = require('../models/Accessory');

async function getAll() {
    let accessories = await Accessory.find().lean(); 

    return accessories;
}

async function getOne(id) {
    return Accessory.findById(id).lean();
}

async function getAllAvailable(ids) {
    return Accessory.find({ _id: {$nin: ids}}).lean();
}

function create(data) {
    let accessory = new Accessory(data);

    return accessory.save();
}

module.exports = {
    getAll,
    getOne,
    getAllAvailable,
    create
}