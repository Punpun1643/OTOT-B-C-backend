const jwt = require('jsonwebtoken');
const HttpError = require("../models/http-error");

module.exports = (req, res, next) => {
    if (req.method === 'OPTIONS') {
        return next();
    }

    // if (req.method === 'GET') {
    //     try {
    //         const url = window.location;
    //         const urlToken = new URLSearchParams(url.search).get('access_token');
    //         if (!(urlToken)) {
    //             return next(new HttpError('Authentication failed!', 401));
    //         }
    //         const decodedToken = jwt.verify(urlToken, 'confidential');
    //         req.userData = { userId: decodedToken.userId }
    //         next();
    //     } catch (err) {
    //         return next(new HttpError('Authentication failed!', 401));
    //     }
    // }
    try {
        const token = req.headers.authorization.split(" ")[1];
        if (!(token)) {
            return next(new HttpError('Authentication failed!', 401));
        }
        const decodedToken = jwt.verify(token, 'confidential');
        req.userData = { userId: decodedToken.userId }
        next();
    } catch (err) {
        return next(new HttpError('Authentication failed!', 401));
    }
}