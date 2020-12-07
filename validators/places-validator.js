const {check} = require('express-validator')

 exports.createPlaceVal=[
    check('title')
      .not()
      .isEmpty(),
    check('description').isLength({ min: 5 }),
    check('address')
      .not()
      .isEmpty()
  ]

 exports.updatePlaceVal = [
    check('title')
      .not()
      .isEmpty(),
    check('description').isLength({ min: 5 })
  ]