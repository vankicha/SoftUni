const express = require('express');
const handlebars = require('express-handlebars');
const bodyParser = require('body-parser');

module.exports = (app) => {

    //TODO: Setup the view engine
    app.engine('.hbs', handlebars({extname: '.hbs'}));
    app.set('view enigne', '.hbs');

    //TODO: Setup the body parser
    app.use(bodyParser.urlencoded({ extended: false }));

    //TODO: Setup the static files
    app.use(express.static('./static'));
};