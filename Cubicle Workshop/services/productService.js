const Cube = require('../models/Cube');

function getAll({ search, from, to }) {

    let result = Cube.find().lean();

    /* (search ? p.name.toLowerCase().includes(search) : true) &&
        (from ? Number(p.difficultyLevel) >= from : true) &&
        (to ? Number(p.difficultyLevel) <= to : true) */

    return result;
}

function getOne(id) {
    return Cube.findById(id).lean();
}

function create(data) {
    let cube = new Cube(data);

    return cube.save();
}

module.exports = {
    getAll,
    getOne,
    create
}

//BUSSINES LOGIC