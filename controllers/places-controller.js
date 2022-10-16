const fs = require('fs');

const HttpError = require('../models/http-error');
const { v4: uuid } = require('uuid');
const { validationResult } = require('express-validator');
const getCoordsForAddress = require('../utils/location');
const Place = require('../models/place');
const User = require('../models/user');
const mongoose = require('mongoose');

const getPlaceById = async (req, res, next) => { 
    const placeId = req.params.pid;
    
    let place;
    try {
        place = await Place.findById(placeId);
    } catch (err) {
        const error = new HttpError('Something went wrong, could not find a place!', 500);
        return next(error);
    }

    if (!place) {
        const error = new HttpError('Could not find a place for the provided id!', 404);
        return next(error);
    }

    res.json({ place: place.toObject( { getters: true } ) });
};

const getPlacesByUserId = async (req, res, next) => {
    const userId = req.params.uid;

    let places;
    try {
        places = await Place.find({ creator: userId });
    } catch (err) {
        const error = new HttpError('Fetching places failed, please try again later', 500);
        return next(error);
    }

    if (!places || places.length === 0) {
        const error = new HttpError('Could not find places for the provided user id!', 404);
        return next(error);  
    }

    res.json({ places: places.map(place => place.toObject({ getters: true })) });
}

const createPlace = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(new HttpError('Invalid inputs passed, please check your data', 422));
    }

    const { title, description, address } = req.body; 

    let coordinates;
    try {
        coordinates = await getCoordsForAddress(address);
    } catch (error) {
        return next(error);
    }

    const createdPlace = new Place({
        title,
        description,
        address,
        location: coordinates,
        image: req.file.path,
        creator: req.userData.userId
    });

    let user;

    try {
        // check if the creator id, exist
        user = await User.findById(req.userData.userId);
    } catch (err) {
        return next(new HttpError('Creating place failed, please try again!', 500));
    }

    if (!user) {
        return next(new HttpError('Could not find user for provided id!', 404));
    }

    try {
        // save created place to user who is the creator
        const sess = await mongoose.startSession();
        sess.startTransaction();
        await createdPlace.save({ session: sess });
        user.places.push(createdPlace);
        await user.save({ session: sess });
        await sess.commitTransaction();
    } catch (err) {
        const error = new HttpError('Creating place failed, please try again!', 500);
        return next(error);
    }
    
    res.status(201).json({ place: createdPlace });
}

const modifyPlace = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(new HttpError('Invalid inputs passed, please check your data', 422));
    }

    const { title, description, address, creator } = req.body;
    const placeId = req.params.pid;

    let place;
    try {
        place = await Place.findById(placeId);
    } catch (err) {
        return next(new HttpError('Something went wrong, could not update place!', 500));
    }

    let coordinates;
    try {
        coordinates = await getCoordsForAddress(address);
    } catch (error) {
        return next(error);
    }

    if (place.creator.toString() !== req.userData.userId) {
        return next(new HttpError('You are not allowed to edit this place!', 403));
    }

    place.title = title;
    place.description = description;
    place.location = coordinates;
    place.address = address;
    place.creator = creator;

    try {
        await place.save();
    } catch (err) {
        return next(new HttpError('Something went wrong, could not update place!', 500));
    }

    res.status(200).json({place: place.toObject({ getters: true })});
}

const updatePlace = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(new HttpError('Invalid inputs passed, please check your data', 422));
    }

    const { title, description } = req.body;
    const placeId = req.params.pid;

    let place;
    try {
        place = await Place.findById(placeId); 
    } catch (err) {
        return next(new HttpError('Something went wrong, could not update place!', 500));
    }
    
    if (place.creator.toString() !== req.userData.userId) {
        return next(new HttpError('You are not allowed to edit this place!', 403));
    }

    place.title = title;
    place.description = description;

    try {
        await place.save();
    } catch (err) {
        const error = new HttpError('Something went wrong, could not update place!', 500);
        return next(error);
    }
    res.status(200).json({ place: place.toObject({ getters: true }) });
}

const deletePlace = async (req, res, next) => {
    const placeId = req.params.pid;

    let place;
    // general error checking
    try {
        place = await Place.findById(placeId).populate('creator');
    } catch (err) {
        return next(new HttpError('Something went wrong, could not delete a place!', 500));
    }
    
    // check whether place actually exists
    if (!place) {
        return next(new HttpError('Could not find place for this id', 404));
    }

    if (place.creator.id !== req.userData.userId) {
        return next(new HttpError('You are not allowd to delete this place!', 403));
    }

    const imagePath = place.image;

    try {
        const sess = await mongoose.startSession();
        sess.startTransaction();
        await place.remove({ session: sess });
        // remove place from user
        place.creator.places.pull(place);
        await place.creator.save({ session: sess });
        await sess.commitTransaction();
    } catch (err) {
        return next(new HttpError('Something went wrong, could not delete place!', 500));
    }

    fs.unlink(imagePath, err => {
        console.log(err);
    });

    res.status(200).json({ message: 'Deleted place successfully!' });
}

exports.getPlaceById = getPlaceById;
exports.getPlacesByUserId = getPlacesByUserId;
exports.createPlace = createPlace;
exports.updatePlace = updatePlace;
exports.modifyPlace = modifyPlace;
exports.deletePlace = deletePlace;
