// import dependencies
const { Schema, model } = require('mongoose')
const {
  production,
  REFRESH_TOKEN_EXPIRY_SCHEMA_PROD,
  REFRESH_TOKEN_EXPIRY_SCHEMA_DEV
} = require('../config/env')

const refreshTokenSchema = new Schema({
  uuid: {
    type: Schema.Types.UUID,
    unique: true
  },
  userId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'user'
  },
  token: {
    type: String,
    required: true
  },
  ipAddress: {
    type: String,
    default: null
  },
  deviceMetadata: {
    type: Map,
    of: String
  },
  uaFingerprint: {
    type: String,
    required: true // TODO: refer to TODO in userAgentParser
  },
  createdAt: {
    type: Date,
    default: Date.now, // reference the function instead of calling it for mongoose to call it each time the document is generated
    expires: production
      ? REFRESH_TOKEN_EXPIRY_SCHEMA_PROD
      : REFRESH_TOKEN_EXPIRY_SCHEMA_DEV
  }
}, {
  timestamps: {
    createdAt: false,
    updatedAt: true
  }
})

const refreshTokenModel = model('refreshToken', refreshTokenSchema)

module.exports = refreshTokenModel
