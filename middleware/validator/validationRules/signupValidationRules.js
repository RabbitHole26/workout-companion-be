// import dependencies
const { check } = require('express-validator')
const validatePassword = require('./passwordResetValidationRules')
const validateEmail = require('./requestPasswordResetValidationRules')

const signupValidationRules = [
  check('username')
    .trim()
    // .notEmpty()
    //   .withMessage('Username is required')
    .isLength({min: 3, max: 20})
      .withMessage('Username must be between 3 and 20 characters long'),

  ...validateEmail,
  ...validatePassword
]

module.exports = signupValidationRules
