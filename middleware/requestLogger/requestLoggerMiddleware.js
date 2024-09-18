// import dependencies
const express = require('express')

// deploy requestLogger
const requestLogger = express()

requestLogger.use((req, res, next) => {
  console.log(`\nRequest path: ${req.path}\nRequest method: ${req.method}`)
  next()
})

module.exports = requestLogger
