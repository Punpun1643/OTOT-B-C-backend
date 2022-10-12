const { v4: uuid } = require('uuid');
const HttpError = require('../models/http-error');
const { validationResult } = require('express-validator');

DUMMY_USERS = [
    {
        id: 'u1',
        name: 'usernumberone',
        email: 'example@gmail.com',
        password: 'test123'
    }
];

const getUser = (req, res, next) => {
    res.status(200).json({ users: DUMMY_USERS });
}

const signup = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        throw new HttpError('Invalid inputs passed, please check your data', 422);
    }

    const { name, email, password } = req.body;

    const hasUser = DUMMY_USERS.find(u => u.email === email);
    if (hasUser) {
        throw new HttpError('This user email already exists!', 422);
    }

    const createdUser = {
        id: uuid(),
        name: name,
        email: email,
        password: password
    }

    DUMMY_USERS.push(createdUser);
    
    res.status(201).json({ user: createdUser });
}

const login = (req, res, next) => {
    const { email, password } = req.body;

    const identifiedUser = DUMMY_USERS.find(u => u.email === email);
    if (!identifiedUser || identifiedUser.password != password) {
        throw new HttpError('Could not identify user, wrong credentials!', 401);
    }

    res.json({ message: 'Logged In!' });
}

exports.getUser = getUser;
exports.signup = signup;
exports.login = login;
