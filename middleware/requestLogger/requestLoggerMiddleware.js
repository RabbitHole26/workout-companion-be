const requestLogger = (req, res, next) => {
  console.log(`\nREQUEST LOGGER 🔍\n 👉 Request path: ${req.path}\n 👉 Request method: ${req.method}\n 👉 Request body: ${JSON.stringify(req.body, null, 2)}\n 👉 Request query: ${JSON.stringify(req.query, null, 2)}\n 👉 Request cookie: ${req.headers.cookie}\n 👉 Request headers: ${JSON.stringify(req.headers, null, 2)}`)
  
  next()
}

module.exports = requestLogger
