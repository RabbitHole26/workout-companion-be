// import dependencies
const { check } = require('express-validator')
const passwordValidationRules = require('./passwordResetValidationRules')

const signupValidationRules = [
  check('username')
    .trim()
    // .notEmpty()
    //   .withMessage('Username is required')
    .isLength({min: 3, max: 20})
      .withMessage('Username must be between 3 and 20 characters long'),

  check('email')
    .trim()
    // .notEmpty()
    //   .withMessage('Email is required')
    .isEmail()
      .withMessage('Please provide a valid email')
    .normalizeEmail(),

  ...passwordValidationRules // spread password validation rules
]

module.exports = signupValidationRules
