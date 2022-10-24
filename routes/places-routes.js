const express = require('express');
const { check } = require('express-validator');

const placeControllers = require('../controllers/places-controller');
const fileUpload = require('../middleware/file-upload');
const checkAuth = require('../middleware/check-auth');

const router = express.Router();

// open to all users
router.get('/:pid', placeControllers.getPlaceById);

// router.get('/user/:uid', placeControllers.getPlacesByUserId);

// limit to requests with valid token
router.use(checkAuth);
router.get('/user/:uid', placeControllers.getPlacesByUserId);
// router.get('/user/:uid', placeControllers.getPlacesByUserId);
router.post('/',
    fileUpload.single('image'),
    [
        check('title').not().isEmpty(),
        check('description').isLength({ min: 5 }),
        check('address').not().isEmpty()
    ],
    placeControllers.createPlace
);

// update PUT
router.put('/:pid', 
    [
        check('title').not().isEmpty(),
        check('description').isLength({ min: 5 }),
        check('address').not().isEmpty(),
        check('creator').not().isEmpty()
    ], 
    placeControllers.modifyPlace
);

// update PATCH
router.patch('/:pid', 
    [
        check('title').not().isEmpty(),
        check('description').isLength({ min: 5})
    ], 
    placeControllers.updatePlace
);

// delete
router.delete('/:pid', placeControllers.deletePlace);

module.exports = router;
