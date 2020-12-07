const express = require('express');
const usersController = require('../controllers/users-controllers');
const fileUpload = require('../middlewares/file-upload');
const validator = require('../validators/users-validator')

const router = express.Router();

router.get('/', usersController.getUsers);

router.post(
  '/signup',
  fileUpload.single('image'),
  validator.postUserVal,
  usersController.signup
);

router.post('/login', usersController.login);

module.exports = router;
