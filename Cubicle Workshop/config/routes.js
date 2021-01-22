// TODO: Require Controllers...
const cubeController = require('../controllers/cube');

module.exports = (app) => {
    app.get('/', cubeController.getCubes);
    app.get('/details/:id', cubeController.getCube);
    app.get('/create', cubeController.getCreate);
    app.get('/about', cubeController.getAbout);
    app.post('/create', cubeController.postCreate);
};