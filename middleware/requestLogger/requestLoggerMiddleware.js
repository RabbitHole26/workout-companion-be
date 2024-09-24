// import dependencies
const express = require('express')

// deploy requestLogger
const requestLogger = express()

requestLogger.use((req, res, next) => {
  console.log(`\nRequest path: ${req.path}\nRequest method: ${req.method}\nRequest body: ${JSON.stringify(req.body, null, 2)}`)
  next()
})

module.exports = requestLogger
