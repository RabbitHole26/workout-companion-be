// import dependencies
const UAParser = require('ua-parser-js')

const userAgentParser = (req, res, next) => {
  const uaHeader = req.headers['user-agent']

  if (uaHeader) {
    const parser = new UAParser(uaHeader)
    const result = parser.getResult()
  
    console.log(`\nUSER AGENT PARSER 🔍\n 👉 Parsed results: ${JSON.stringify(result, null, 2)}`)

    req.userAgent = result // attach parsed result to req object for downstream use
  }

  next()
}

module.exports = userAgentParser
