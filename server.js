// import dependencies
const express = require('express')
const cors = require('cors')
const cookieParser = require('cookie-parser')
const requestLogger = require('./middleware/requestLogger/requestLoggerMiddleware')
const appRouter = require('./routes/appRouter')
const errorHandler = require('./middleware/errorHandler/errorHandlerMiddleware')
const db = require('./config/db')
const { ORIGIN } = require('./config/env')

// create express app
const app = express()

// use global middleware
app.use(requestLogger) // logger middleware
app.use(cors({
  credentials: true, // allow sending cookies from FE, in FE axios needs 'withCredentials' option set to true
  origin: ORIGIN // allowed origin
})) // CORS middleware
app.use(express.json()) // JSON middleware
app.use(express.urlencoded({ extended: true })) // URL-encoded middleware
app.use(cookieParser()) // cookie-parser middleware

// define routes
app.use('/api', appRouter) // app routes

// error handler middleware placed at the end
app.use(errorHandler)

// connect to database and start the server
db(app) // connect to DB and listen for requests
