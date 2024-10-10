// import dependencies
const express = require('express')

// deploy requestLogger
const requestLogger = express()

requestLogger.use((req, res, next) => {
  console.log(`\nREQUEST LOGGER 🔍\nRequest path: ${req.path}\nRequest method: ${req.method}\nRequest body: ${JSON.stringify(req.body, null, 2)}\nRequest query: ${JSON.stringify(req.query, null, 2)}\nRequest cookie: ${req.headers.cookie}`)
  
  next()
})

module.exports = requestLogger
