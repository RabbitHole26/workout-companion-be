const { Schema, model } = require('mongoose')

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
  createdAt: {
    type: Date,
    default: Date.now(),
    // set token expiration
    expires: 3600 // expiration time in seconds (1h = 60 x 60)
  }
})

const pwTokenModel = model('pwToken', pwTokenSchema)

module.exports = pwTokenModel
