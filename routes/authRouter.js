// import dependencies
const express = require('express')
const validator = require('../middleware/validator/validatorMiddleware')
const signupRules = require('../middleware/validator/validationRules/signupValidationRules')
const loginRules = require('../middleware/validator/validationRules/loginValidationRules')
const { 
  signup,
  login,
  logout,
  refreshToken
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

module.exports = userRouter
