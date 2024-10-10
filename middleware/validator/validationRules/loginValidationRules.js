// import dependencies
const { check } = require('express-validator')
const validateEmail = require('./requestPasswordResetValidationRules')

const loginValidationRules = [
  ...validateEmail,

  check('password')
    .notEmpty()
      .withMessage('Password is required')
]

module.exports = loginValidationRules
