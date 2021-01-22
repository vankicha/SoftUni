const BaseModel = require('./base');
const path = require('path');

class CubeModel extends BaseModel {
    constructor() {
        const filePath = path.resolve('./config/database.json');
        super(filePath);
    }

    insert(name, description, imageUrl, difficultyLevel) {
        const entry = { name, description, imageUrl, difficultyLevel: Number(difficultyLevel) };
        return super.insert(entry);
    }
}

module.exports = new CubeModel();