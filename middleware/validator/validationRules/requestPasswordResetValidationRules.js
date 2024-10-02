// import dependencies
const { check } = require('express-validator')

const requestPasswordResetValidationRules = [
  check('email')
    .trim()
    .isEmail()
      .withMessage('Please provide a valid email')
    .normalizeEmail()
]

module.exports = requestPasswordResetValidationRules
