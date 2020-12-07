const express = require('express');

const placesControllers = require('../controllers/places-controllers');
const checkAuth = require('../middlewares/check-auth');
const fileUpload = require('../middlewares/file-upload');
const validator = require('../validators/places-validator')

const router = express.Router();

router.get('/:pid', placesControllers.getPlaceById);

router.get('/user/:uid', placesControllers.getPlacesByUserId);

router.use(checkAuth)

router.post(
  '/',
  fileUpload.single('placeImage'),
  validator.createPlaceVal,
  placesControllers.createPlace
);

router.patch(
  '/:pid',
  validator.updatePlaceVal,
  placesControllers.updatePlace
);

router.delete('/:pid', placesControllers.deletePlace);

module.exports = router;
