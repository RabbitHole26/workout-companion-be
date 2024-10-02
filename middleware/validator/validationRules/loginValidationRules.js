// import dependencies
const { check } = require('express-validator')

const loginValidationRules = [
  check('email')
    .trim()
    // .notEmpty()
    //   .withMessage('Email is required')
    .isEmail()
      .withMessage('Please provide a valid email')
    .normalizeEmail(),

  check('password')
    .notEmpty()
      .withMessage('Password is required')
]

module.exports = loginValidationRules
