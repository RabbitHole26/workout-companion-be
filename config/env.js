// dotenv
require('dotenv').config()

// mode
const NODE_ENV = process.env.NODE_ENV
const production = NODE_ENV === 'prod'

// cors
const ORIGIN = process.env.ORIGIN

// email
const EMAIL_HOST = process.env.EMAIL_HOST
const EMAIL_USERNAME = process.env.EMAIL_USERNAME
const EMAIL_PASSWORD = process.env.EMAIL_PASSWORD

// db
const PORT = process.env.PORT || 5000
const DB_URI = process.env.DB_URI

// jwt
// * secrets
const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET
// * token expiry - PROD
const ACCESS_TOKEN_EXPIRY_PROD = process.env.ACCESS_TOKEN_EXPIRY_PROD
const REFRESH_TOKEN_EXPIRY_PROD = process.env.REFRESH_TOKEN_EXPIRY_PROD
// * token expiry - DEV
const ACCESS_TOKEN_EXPIRY_DEV = process.env.ACCESS_TOKEN_EXPIRY_DEV
const REFRESH_TOKEN_EXPIRY_DEV = process.env.REFRESH_TOKEN_EXPIRY_DEV

// cookie
const COOKIE_MAXAGE_PROD = process.env.COOKIE_MAXAGE_PROD
const COOKIE_MAXAGE_DEV = process.env.COOKIE_MAXAGE_DEV

// cloudinary
const CLOUDINARY_NAME = process.env.CLOUDINARY_NAME
const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY
const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET

module.exports = {
  NODE_ENV,
  production,
  ORIGIN,
  EMAIL_HOST,
  EMAIL_USERNAME,
  EMAIL_PASSWORD,
  PORT,
  DB_URI,
  ACCESS_TOKEN_SECRET,
  ACCESS_TOKEN_EXPIRY_PROD,
  ACCESS_TOKEN_EXPIRY_DEV,
  REFRESH_TOKEN_SECRET,
  REFRESH_TOKEN_EXPIRY_PROD,
  REFRESH_TOKEN_EXPIRY_DEV,
  COOKIE_MAXAGE_PROD,
  COOKIE_MAXAGE_DEV,
  CLOUDINARY_NAME,
  CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET
}
