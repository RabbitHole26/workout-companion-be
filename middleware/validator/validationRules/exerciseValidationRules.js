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
    .isInt({max: 1000})
      .withMessage('Reps cannot be greater than 1000'),

  check('weight')
    .trim()
    // .notEmpty()
    //   .withMessage('Weight is required')
    .isInt({min: 0})
      .withMessage('Weight must be a non-negative number')
    .isInt({max: 1000})
      .withMessage('Weight cannot be greater than 1000')
]

module.exports = exerciseValidationRules
