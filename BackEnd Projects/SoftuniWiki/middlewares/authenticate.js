const config = require('../config/config');
const jwt = require('jsonwebtoken');

module.exports = function () {
    return (req, res, next) => {
        let token = req.cookies[config.USER_SESSION];

        if (token) {
            jwt.verify(token, config.SECRET, function (err, decoded) {
                if (err) {
                    res.clearCookie(config.USER_SESSION);
                } else {
                    req.user = decoded;
                    res.locals.user = decoded;
                    res.locals.isAuthenticated = true;
                }
            });
        }
        next();
    };
};
