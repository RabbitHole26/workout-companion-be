// import dependencies
const CustomError = require('../../classes/customError')
const UAParser = require('ua-parser-js')
const { keysArr } = require('../../config/env')

const userAgentParser = (req, res, next) => {
  const uaHeader = req.headers['user-agent']

  const errorMessage = 'Your browser is blocking required information, please adjust privacy settings or use a different browser'

  if (!uaHeader || uaHeader === 'Mozilla/5.0') return next(new CustomError(errorMessage, 400)) // TODO: fallback to device fingerprint which doesn't require user-agent header to allow user agents with strict privacy settings

  const parser = new UAParser(uaHeader)
  const result = parser.getResult()

  // iterate through array provided via env variables (keysArr) 
  // 'keysArr' items must be strings divided with hyphen, eg:
    // IF result = {... , os: {name: iOS, version: 12.0} , browser: {name: Chrome, version: 130.0.0}}
    // THEN 'keysArr' must include string 'os-browser'
  // default value for 'keysArr' could be 'os-browser-engine'
  function generateUaProps(arr) {
    const propsObj = {}

    arr.forEach(item => {
      const prop = result[item]

      if (prop && prop.name) {
        if (!propsObj[prop]) propsObj[item] = prop.name.concat(`-${prop.version || 'unknown_ver'}`)
      } else {
        return next(new CustomError(errorMessage, 400)) // TODO: fallback to device fingerprint which doesn't require user-agent header to allow user agents with strict privacy settings
      }
    })

    return propsObj
  }

  const deviceMetadata = {
    rawUaString: result.ua,
    ...generateUaProps(keysArr),
    deviceType: result.device.type || 'desktop' // default to 'desktop' as it may return undefined on desktop devices
  }

  // .filter(Boolean) removes undefined and null values from the array
  const uaFingerprint = Object.values(deviceMetadata).slice(1).filter(Boolean).join('-') // generic user agent fingerprint

  console.log(`\nUSER AGENT PARSER 🔍\n 👉 Parser results: ${JSON.stringify(result, null, 2)}\n 👉 Device metadata: ${JSON.stringify(deviceMetadata, null, 2)}\n 👉 Device fingerprint: ${uaFingerprint}`)

  // attach props to req object for downstream use
  req.deviceMetadata = deviceMetadata
  req.uaFingerprint = uaFingerprint

  next()
}

module.exports = userAgentParser
