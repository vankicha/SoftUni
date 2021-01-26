const uniqid = require('uniqid');
const Cube = require('../models/Cube');
const productData = require('../data/productData');

function getAll({ search, from, to }) {

    let result = productData
        .getAll()
        .filter((p) =>
            (search ? p.name.toLowerCase().includes(search) : true) &&
            (from ? Number(p.difficultyLevel) >= from : true) &&
            (to ? Number(p.difficultyLevel) <= to : true)
        );

    return result;
}

function getOne(id) {
    return productData.getOne(id);
}

function create(data) {
    let cube = new Cube(
        uniqid(),
        data.name,
        data.descrption,
        data.imageUrl,
        data.difficultyLevel
    )

    return productData.create(cube);
}

module.exports = {
    getAll,
    getOne,
    create
}

//BUSSINES LOGIC