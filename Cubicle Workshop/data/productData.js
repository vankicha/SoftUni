/* const fs = require('fs/promises');
const path = require('path');
const productsDb = require('../config/database.json');

module.exports = {
    getAll() {
        return productsDb;
    },

    getOne(id) {
        return productsDb.find(x => x.id === id);
    },

    create(product) {
        productsDb.push(product);

        return fs.writeFile(
            path.join(__dirname, '../config/database.json'),
            JSON.stringify(productsDb)
        );
    }
} */