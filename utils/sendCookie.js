// import dependencies
const { production, COOKIE_MAXAGE_PROD, COOKIE_MAXAGE_DEV } = require('../config/env')

const sendCookie = (
  res, // response object
  name, // name of the cookie (key in key value pair)
  payload,
  next // next fn available in auth controllers
) => {
  try {
    res.cookie(
      name,
      payload,
      {
        httpOnly: true, // prevent JS from accessing the cookie
        secure: production, // send cookie only through HTTPS protocol
        sameSite: production ? 'None' : 'Lax', // set how cookie is sent depending on CORS context
        maxAge: production // set cookie expiry
          ? COOKIE_MAXAGE_PROD
          : COOKIE_MAXAGE_DEV
      }
    )
  } catch (error) {
    return next(error) // pass any errors to error middleware
  }
}

module.exports = sendCookie
