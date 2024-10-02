// import dependencies
const { check } = require('express-validator')

const exerciseValidationRules = [
  check('title')
    .trim()
    // .notEmpty()
    //   .withMessage('Title is required')
    .isLength({min: 1, max: 50})
      .withMessage('Title must be between 1 and 50 characters long'),

  check('reps')
    .trim()
    // .notEmpty()
    //   .withMessage('Reps is required')
    .isInt({min: 1})
      .withMessage('Reps must be non-negative number greater than 0')
    .custom((val, {req}) => {
      const limit = req.body.reps > 1000

      if (limit) throw new Error('Reps cannot be greater than 1000')

      return true
    }),

  check('weight')
    .trim()
    // .notEmpty()
    //   .withMessage('Weight is required')
    .isInt({min: 0})
      .withMessage('Weight must be a non-negative number')
    .custom((val, {req}) => {
      const limit = req.body.weight > 1000

      if (limit) throw new Error('Weight cannot be greater than 1000')

      return true
    })
]

module.exports = exerciseValidationRules
