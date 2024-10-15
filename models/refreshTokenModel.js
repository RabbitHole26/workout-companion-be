// import dependencies
const { Schema, model } = require('mongoose')
const {
  production,
  REFRESH_TOKEN_EXPIRY_SCHEMA_PROD,
  REFRESH_TOKEN_EXPIRY_SCHEMA_DEV
} = require('../config/env')

const refreshTokenSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'user'
  },
  token: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now, // reference the function instead of calling it for mongoose to call it each time the document is generated
    expires: production
      ? REFRESH_TOKEN_EXPIRY_SCHEMA_PROD
      : REFRESH_TOKEN_EXPIRY_SCHEMA_DEV
  },
  deviceMetadata: {
    ipAddress: {
      type: String
    },
    userAgent: {
      type: Object
    }
  }
}, {
  timestamps: {
    createdAt: false,
    // createdAt: true,
    updatedAt: true
  }
})

const refreshTokenModel = model('refreshToken', refreshTokenSchema)

module.exports = refreshTokenModel
