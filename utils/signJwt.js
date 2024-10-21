// import dependencies
const jwt = require('jsonwebtoken')
const { 
  production,
  ACCESS_TOKEN_SECRET,
  REFRESH_TOKEN_SECRET,
  ACCESS_TOKEN_EXPIRY_PROD,
  ACCESS_TOKEN_EXPIRY_DEV,
  REFRESH_TOKEN_EXPIRY_PROD,
  REFRESH_TOKEN_EXPIRY_DEV
} = require('../config/env')

const signJwt = (
  payload,
  tokenType // must be a string: 'accessToken' or 'refreshToken'
) => {
  const accessToken = tokenType === 'accessToken'

  function setExpiry () {
    if (production) {
      return accessToken 
        ? ACCESS_TOKEN_EXPIRY_PROD
        : REFRESH_TOKEN_EXPIRY_PROD
    } 
      
    return accessToken
      ? ACCESS_TOKEN_EXPIRY_DEV
      : REFRESH_TOKEN_EXPIRY_DEV
  }

  return jwt.sign(
    payload,
    accessToken ? ACCESS_TOKEN_SECRET : REFRESH_TOKEN_SECRET,
    {
      expiresIn: setExpiry()
    }
  )
}

module.exports = signJwt
