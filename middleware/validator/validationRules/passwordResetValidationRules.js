const { check } = require('express-validator')

const passwordResetValidationRules = [
  check('password')
  // .notEmpty()
  //   .withMessage('Password is required')
  .isStrongPassword({
    minLength: 8,
    minLowercase: 1,
    minUppercase: 1,
    minNumbers: 1,
    minSymbols: 1
  })
    .withMessage('Password must be at least 8 characters long and include a mix of uppercase, lowercase, numbers, and special characters'),
  
  check('confirmPassword')
  .notEmpty()
    .withMessage('Confirm password is required')
  .custom((val, {req}) => {
    const match = val === req.body.password
  
    if (!match) {
      throw new Error('Password and confirm password must match')
    }
  
    return true
  })
]

module.exports = passwordResetValidationRules
