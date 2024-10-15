// import dependencies
const express = require('express')
const verifyPwToken = require('../middleware/verifyPwToken/verifyPwTokenMiddleware')
const validator = require('../middleware/validator/validatorMiddleware')
const userAgentParser = require('../middleware/userAgentParser/userAgentParserMiddleware')
const signupRules = require('../middleware/validator/validationRules/signupValidationRules')
const loginRules = require('../middleware/validator/validationRules/loginValidationRules')
const requestPwResetRules = require('../middleware/validator/validationRules/requestPasswordResetValidationRules')
const pwResetRules = require('../middleware/validator/validationRules/passwordResetValidationRules')
const { 
  signup,
  login,
  logout,
  refreshToken,
  verifyPasswordToken,
  requestPasswordReset,
  passwordReset
} = require('../controllers/authController')

// deploy router
const authRouter = express.Router()
const coreAuth = express.Router()

// apply userAgentParser middleware to coreAuth routes
coreAuth.use(userAgentParser)

// ...api/auth/signup
coreAuth.post(
  '/signup', 
  validator(signupRules), 
  signup
)

// ...api/auth/login
coreAuth.post(
  '/login',
  validator(loginRules), 
  login
)

// ...api/auth/logout
authRouter.get(
  '/logout',
  logout
)

// ...api/auth/refresh-token
coreAuth.get(
  '/refresh-token',
  refreshToken
)

// mount the coreAuth sub-router to the authRouter
authRouter.use('/', coreAuth)

// ...api/auth/request-password-reset
authRouter.post(
  '/request-password-reset',
  validator(requestPwResetRules),
  requestPasswordReset
)

// apply verifyPwToken middleware to the routes below
authRouter.use(verifyPwToken)

// ...api/auth/verify-password-token
authRouter.post(
  '/verify-password-token',
  verifyPasswordToken
)

// ...api/auth/password-reset
authRouter.post(
  '/password-reset',
  validator(pwResetRules),
  passwordReset
)

module.exports = authRouter
