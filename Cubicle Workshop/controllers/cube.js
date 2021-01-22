const cubeModel = require('../models/cube');

module.exports = {
    getCubes: function (req, res) {
        const { search, from, to } = req.query;
        const cubes = req.query.hasOwnProperty('search') ? cubeModel.filter(search, from, to) : cubeModel.getAll();
        res.render('index.hbs', { layout: false, cubes });
    },
    getCube: function (req, res) {
        const { id } = req.params;
        cubeModel
            .findById(id)
            .then((data) => {
                let { name, description, difficultyLevel, imageUrl } = data;
                res.render('details.hbs', { layout: false, name, description, difficultyLevel, imageUrl });
            });
    },
    getCreate: function (req, res) {
        res.render('create.hbs', { layout: false });
    },
    postCreate: function (req, res) {
        let { name, description, difficultyLevel, imageUrl } = req.body;
        cubeModel
            .insert(name, description, imageUrl, difficultyLevel)
            .then(() => { res.redirect('/') });

    },
    getAbout: function (req, res) {
        res.render('about.hbs', { layout: false });
    }
}