const {check} = require('express-validator')

exports.postUserVal = [
    check('name')
      .not()
      .isEmpty(),
    check('email')
      .normalizeEmail() 
      .isEmail(),
    check('password').isLength({ min: 6 })
  ]