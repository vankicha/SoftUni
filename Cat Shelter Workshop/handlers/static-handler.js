const url = require('url');
const fs = require('fs');
const path = require('path');

function getContentType(url) {

    if (url.endsWith('css')) {
        return 'text/css';
    } else if (url.endsWith('html')) {
        return 'text/html';
    } else if (url.endsWith('ico')) {
        return 'image/png';
    } else if (url.endsWith('png')) {
        return 'image/png';
    } else if (url.endsWith('jpg')) {
        return 'image/png';
    } else if (url.endsWith('js')) {
        return 'applicaton/javascript';
    }
}

module.exports = (req, res) => {
    const myURL = new URL(req.url, 'https://example.org/abc/xyz?123');
    const pathname = myURL.pathname;

    if (pathname.startsWith('/content') && req.method === 'GET') {

        fs.readFile(`./${pathname}`, (err, data) => {
            if (err) {
                res.writeHead(404, {
                    'Content-Type': 'text/plain'
                });

                res.write('404 Not found');
                res.end();
                return;
            }

            res.writeHead(200, {
                'Content-Type': getContentType(pathname)
            })

            res.write(data);
            res.end();
        })

    } else {
        return true;
    }
}