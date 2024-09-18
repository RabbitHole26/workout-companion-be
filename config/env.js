// dotenv
require('dotenv').config()

// mode
const NODE_ENV = process.env.NODE_ENV

// origin
const ORIGIN = process.env.ORIGIN

// db
const PORT = process.env.PORT || 5000
const DB_URI = process.env.DB_URI

// jwt
const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN

// cloudinary
const CLOUDINARY_NAME = process.env.CLOUDINARY_NAME
const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY
const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET

module.exports = {
  NODE_ENV,
  ORIGIN,
  PORT,
  DB_URI,
  ACCESS_TOKEN_SECRET,
  REFRESH_TOKEN_SECRET,
  CLOUDINARY_NAME,
  CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET
}
