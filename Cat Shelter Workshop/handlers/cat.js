const url = require('url');
const fs = require('fs');
const path = require('path');
const qs = require('querystring');
const formidable = require('formidable');
const breeds = require('../data/breeds');
const cats = require('../data/cats');

const globalPath = path.normalize(path.join(__dirname, '../'))

module.exports = (req, res) => {
    const myURL = new URL(req.url, 'https://example.org/abc/xyz?123');
    const pathname = myURL.pathname;

    if (pathname === '/cats/add-cat' && req.method === 'GET') {

        let filePath = path.normalize(path.join(__dirname, '../views/addCat.html'));
        let readStream = fs.createReadStream(filePath);

        readStream.on('data', (data) => {
            let catBreedPlaceHolder = breeds.map((breed) => `<option value="${breed}">${breed}</option>`);
            let modifiedData = data.toString().replace('{{catBreeds}}', catBreedPlaceHolder);
            res.write(modifiedData);
        });

        readStream.on('end', () => {
            res.end();
        });

        readStream.on('error', (err) => {
            console.log(err);
        });

    } else if (pathname === '/cats/add-breed' && req.method === 'GET') {

        let filePath = path.normalize(path.join(__dirname, '../views/addBreed.html'));

        let readStream = fs.createReadStream(filePath);

        readStream.on('data', (data) => {
            res.write(data);
        });

        readStream.on('end', () => {
            res.end();
        });

        readStream.on('error', (err) => {
            console.log(err);
        });
    } else if (pathname === '/cats/add-breed' && req.method === 'POST') {
        let formData = '';

        req.on('data', (data) => {
            formData += data;
        });

        req.on('end', () => {

            let body = qs.parse(formData);

            fs.readFile('./data/breeds.json', (err, data) => {
                if (err) {
                    throw err;
                }

                let breeds = JSON.parse(data);
                breeds.push(body.breed);
                let json = JSON.stringify(breeds);

                fs.writeFile('./data/breeds.json', json, 'utf-8', () => console.log('The breed was uploaded successfully!'));
            });

            res.writeHead(302, { location: '/' });
            res.end();
        })
    } else if (pathname === '/cats/add-cat' && req.method === 'POST') {
        let form = new formidable.IncomingForm();

        //fields -> object with incoming data from the form
        //files -> object with info about the uploaded file
        form.parse(req, (err, fields, files) => {
            if (err) {
                throw err;
            }

            let oldPath = files.upload.path;
            let newPath = path.normalize(path.join(globalPath, '/content/images/' + files.upload.name));

            fs.rename(oldPath, newPath, (err) => {
                if (err) throw err;
                console.log('Cat was uploaded successfully!');
            })

            fs.readFile('./data/cats.json', (err, data) => {
                if (err) {
                    throw err;
                }

                let allCats = JSON.parse(data);
                allCats.push({ id: (cats.length + 1).toString(), ...fields, image: files.upload.name });
                let json = JSON.stringify(allCats);

                fs.writeFile('./data/cats.json', json, () => {
                    res.writeHead(302, { location: '/' });
                    res.end();
                });

            });
        });
    } else if (pathname.includes('/cats-edit/') && req.method === 'GET') {
        let filePath = path.normalize(path.join(__dirname, '../views/editCat.html'));

        fs.readFile(filePath, (err, data) => {
            if (err) {
                res.writeHead(404, {
                    'Content-Type': 'text/plain'
                });

                res.write('Error was found!');
                res.end();
            }

            res.writeHead(200, {
                'Content-Type': 'text/html'
            });

            let catId = pathname.split('/cats-edit/').pop();
            let currentCat = cats.find((c) => c.id === catId);

            let modifiedData = data.toString().replace('{{id}}', catId);
            modifiedData = modifiedData.toString().replace('{{name}}', currentCat.name);
            modifiedData = modifiedData.toString().replace('{{description}}', currentCat.description);

            let breedsOption = breeds.map(b => `<option value="${b}">${b}</option>`);
            modifiedData = modifiedData.toString().replace('{{catBreeds}}', breedsOption);
            res.write(modifiedData);
            res.end();
        });
    } else if (pathname.includes('/cats-edit/') && req.method === 'POST') {
        let form = new formidable.IncomingForm();

        form.parse(req, (err, fields, files) => {
            if (err) {
                throw err;
            }

            if (files.upload.name !== '') {
                let oldPath = files.upload.path;
                let newPath = path.normalize(path.join(globalPath, '/content/images/' + files.upload.name));
                fs.rename(oldPath, newPath, (err) => {
                    if (err) {
                        throw err;
                    }

                    console.log('File updated successfully!');
                });
            }

            fs.readFile('./data/cats.json', (err, data) => {
                if (err) {
                    throw err;
                }

                let catId = pathname.split('/').pop();
                let allCats = JSON.parse(data);
                let currentCat = allCats.find(x => x.id === catId);
                let newCat = { id: catId, ...fields };

                if (files.upload.name === '') {
                    newCat.image = currentCat.image;
                } else {
                    newCat.image = files.upload.name;
                }

                allCats.splice(catId - 1, 1, newCat);
                let json = JSON.stringify(allCats);

                fs.writeFile('./data/cats.json', json, () => {
                    res.writeHead(302, { location: '/' });
                    res.end();
                });

            });
        });
    } else if (pathname.includes('/cats-find-new-home') && req.method === 'GET') {
        let filePath = path.normalize(path.join(__dirname, '../views/catShelter.html'));

        fs.readFile(filePath, (err, data) => {
            if (err) {
                res.writeHead(404, {
                    'Content-Type': 'text/plain'
                });

                res.write('Error was found!');
                res.end();
            }

            res.writeHead(200, {
                'Content-Type': 'text/html'
            });

            let catId = pathname.split('/').pop();
            let currentCat = cats.find((c) => c.id === catId);

            let modifiedData = data.toString().replace('{{id}}', catId);
            modifiedData = modifiedData.toString().replace('{{image}}', `../content/images/${currentCat.image}`);
            modifiedData = modifiedData.toString().replace('{{name}}', currentCat.name);
            modifiedData = modifiedData.toString().replace('{{name}}', currentCat.name);
            modifiedData = modifiedData.toString().replace('{{description}}', currentCat.description);
            modifiedData = modifiedData.toString().replace('{{breed}}', currentCat.breed);
            modifiedData = modifiedData.toString().replace('{{breed}}', currentCat.breed);
            res.write(modifiedData);
            res.end();
        });

    } else if (pathname.includes('/cats-find-new-home/') && req.method === 'POST') {

        fs.readFile('./data/cats.json', (err, data) => {
            if (err) {
                throw err;
            }

            let catId = pathname.split('/').pop();
            let allCats = JSON.parse(data);
            allCats = allCats.filter(c => c.id !== catId);
            let json = JSON.stringify(allCats);

            fs.writeFile('./data/cats.json', json, () => {
                res.writeHead(302, { location: '/' });
                res.end();
            })
        })
    } else if (pathname.includes('/search') && req.method === 'POST') {
        let form = new formidable.IncomingForm();

        form.parse(req, (err, fields, files) => {
            if (err) {
                throw err;
            }

            let { word } = fields;
            res.writeHead(302, { location: `/search/${word}` });
            res.end();
        });

    } else if (pathname.includes('/search') && req.method === 'GET') {

        let filePath = path.normalize(path.join(__dirname, '../views/home/index.html'));

        fs.readFile(filePath, (err, data) => {
            if (err) {

                res.writeHead(404, {
                    'Content-Type': 'text/plain'
                });

                res.write('404 Not Found!');
                res.end();
                return;
            }

            res.writeHead(200, {
                'Content-Type': 'text/html'
            });
            let word = pathname.split('/').pop().toLowerCase();
            let modifiedCats = cats
                .filter((c) => c.name.toLowerCase().includes(word) || c.description.toLowerCase().includes(word) || c.breed.toLowerCase().includes(word))
                .map((c) => `<li>
                    <img src="${path.join('../content/images/', c.image)}" alt="${c.name}">
                    <h3>${c.name}</h3>
                    <p><span>Breed: </span>${c.breed}</p>
                    <p><span>Description: </span>${c.description}</p>
                    <ul class="buttons">
						<li class="btn edit"><a href="/cats-edit/${c.id}">Change Info</a></li>
						<li class="btn delete"><a href="/cats-find-new-home/${c.id}">New Home</a></li>
					</ul>
                </li>`);
            let modifiedData = data.toString().replace('{{cats}}', modifiedCats.join(''));
            res.write(modifiedData);
            res.end();
        });
    }
    else {
        return true;
    }
}