// import dependencies
const { check } = require('express-validator')

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
      .withMessage('Please provide a valid email'),

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

module.exports = signupValidationRules
