const { v4: uuid } = require('uuid');
const HttpError = require('../models/http-error');
const { validationResult } = require('express-validator');
const User = require('../models/user');

const getUser = async (req, res, next) => {
    let users;

    try {
        users = await User.find({}, '-password');
    } catch (err) {
        return next(new HttpError('Fetching users failed, please try again later', 500));
    }
    res.json({ users: users.map(user => user.toObject({ getters: true })) });
}

const signup = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(new HttpError('Invalid inputs passed, please check your data', 422));
    }

    const { name, email, password } = req.body;

    let existingUser;
    try {
        existingUser = await User.findOne({ email: email });
    } catch (err) {
        return next(new HttpError('Signing up failed, please try again later!', 500));
    }

    if (existingUser) {
        return next(new HttpError('User exists already, please login instead!', 422));
    }
    
    const createdUser = new User({
        name,
        email,
        image: 'https://eonreality.com/wp-content/uploads/2022/03/NUS-.jpeg',
        password,
        places: []
    })

    try {
        await createdUser.save();
    } catch (err) {
        return next(new HttpError('Signing up failed, please try again', 500));
    }
    
    
    res.status(201).json({ user: createdUser.toObject({ getters: true }) });
}

const login = async (req, res, next) => {
    const { email, password } = req.body;

    let existingUser;

    try {
        existingUser = await User.findOne({ email: email });
    } catch (err) {
        return next(new HttpError('Loging in failed, please try again later!', 500));
    }

    if (!existingUser || existingUser.password !== password) {
        const error = new HttpError('Invalid credentials, could not log in!', 401);
        return next(error);
    }

    res.json({ message: 'Logged in!' });
}

exports.getUser = getUser;
exports.signup = signup;
exports.login = login;
