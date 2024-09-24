// dotenv
require('dotenv').config()

// mode
const NODE_ENV = process.env.NODE_ENV
const production = NODE_ENV === 'prod'

// origin
const ORIGIN = process.env.ORIGIN

// email
const EMAIL_HOST = process.env.EMAIL_HOST
const EMAIL_USERNAME = process.env.EMAIL_USERNAME
const EMAIL_PASSWORD = process.env.EMAIL_PASSWORD
const FROM_EMAIL = process.env.FROM_EMAIL

// db
const PORT = process.env.PORT || 5000
const DB_URI = process.env.DB_URI

// jwt
const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET

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
  FROM_EMAIL,
  PORT,
  DB_URI,
  ACCESS_TOKEN_SECRET,
  REFRESH_TOKEN_SECRET,
  CLOUDINARY_NAME,
  CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET
}
