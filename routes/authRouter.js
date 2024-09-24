// import dependencies
const express = require('express')
const validator = require('../middleware/validator/validatorMiddleware')
const signupRules = require('../middleware/validator/validationRules/signupValidationRules')
const loginRules = require('../middleware/validator/validationRules/loginValidationRules')
const requestPwResetRules = require('../middleware/validator/validationRules/requestPasswordResetValidationRules')
const pwResetRules = require('../middleware/validator/validationRules/passwordResetValidationRules')
const { 
  signup,
  login,
  logout,
  refreshToken,
  requestPasswordReset,
  passwordReset
} = require('../controllers/authController')

// deploy router
const userRouter = express.Router()

// ...api/auth/signup
userRouter.post(
  '/signup', 
  validator(signupRules), 
  signup
)

// ...api/auth/login
userRouter.post(
  '/login',
  validator(loginRules), 
  login
)

// ...api/auth/logout
userRouter.get(
  '/logout',
  logout
)

// ...api/auth/refresh-token
userRouter.get(
  '/refresh-token',
  refreshToken
)

// ...api/auth/request-password-reset
userRouter.post(
  '/request-password-reset',
  validator(requestPwResetRules),
  requestPasswordReset
)

userRouter.post(
  '/password-reset',
  validator(pwResetRules),
  passwordReset
)

module.exports = userRouter
