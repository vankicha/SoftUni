const url = require('url');
const fs = require('fs');
const path = require('path');
const cats = require('../data/cats.json');
const breeds = require('../data/breeds.json');

module.exports = (req, res) => {
    const myURL = new URL(req.url, 'https://example.org/abc/xyz?123');
    const pathname = myURL.pathname;

    if (pathname === '/' && req.method === 'GET') {
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

            let modifiedCats = cats.map((c) => `<li>
                    <img src="${path.join('./content/images/', c.image)}" alt="${c.name}">
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
    } else {
        return true;
    }
}