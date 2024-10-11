const { Schema, model } = require('mongoose')
const { 
  production,
  PASSWORD_TOKEN_EXPIRY_PROD,
  PASSWORD_TOKEN_EXPIRY_DEV
} = require('../config/env')

const pwTokenSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'user'
  },
  token: {
    type: String,
    required: true
  },
  // usage of custom createdAt field to leverage mongoose TTL index to manage token expiry
  createdAt: {
    type: Date,
    default: Date.now,
    // mongo will delete expired documents automatically when the `expires` prop is defined (TTL: Time To Live index)
    expires: production
      ? PASSWORD_TOKEN_EXPIRY_PROD
      : PASSWORD_TOKEN_EXPIRY_DEV
  }
})

const pwTokenModel = model('pwToken', pwTokenSchema)

pwTokenModel.createIndexes() // create indexes on app startup

module.exports = pwTokenModel
