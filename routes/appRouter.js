// import dependencies
const express = require('express')
const exerciseRouter = require('./exerciseRouter')
const authRouter = require('./authRouter')
const settingsRouter = require('./settingsRouter')
const verifyJWT = require('../middleware/verifyJWT/verifyJwtMiddleware')

// deploy router
const appRouter = express.Router()

// routes
appRouter.use('/auth', authRouter)

// apply verifyJWT middleware to the routers below
appRouter.use(verifyJWT)

appRouter.use('/exercise', exerciseRouter)

appRouter.use('/settings', settingsRouter)

module.exports = appRouter
