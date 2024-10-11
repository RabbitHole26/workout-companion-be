// import dependencies
const { Schema, model } = require('mongoose')
const { randomUUID } = require('crypto') // node.js in-build method from crypto module to generate UUID subtype 4
const CustomError = require('../classes/customError')
const bcrypt = require('bcryptjs')

const userSchema = new Schema({
  uuid: {
    type: Schema.Types.UUID,
    unique: true,
    default: () => randomUUID() // generate random UUID v4 when a document is created
  },
  username: {
    type: String,
    required: [true, 'Username is required']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true
  },
  password: {
    type: String,
    required: [true, 'Password is required']
  },
  avatarUrl: {
    type: String,
    default: null
  },
  refreshToken: {
    type: String,
    default: null
  }
}, {
  timestamps: true
})

// static signup method
userSchema.statics.createUser = async function (data) {
  const {username, email, password} = data

  // check email uniqueness
  const emailExists = await this.findOne({email})

  if (emailExists) throw new CustomError('Email already in use', 400)

  // hash password
  const salt = await bcrypt.genSalt(10)
  const pwHash = await bcrypt.hash(password, salt)

  // create user
  const user = await this.create({
    username: username,
    email: email,
    password: pwHash
  })

  return user
}

// static login method
userSchema.statics.verifyLoginCredentials = async function (
  email, 
  password
) {
  // check if user exists
  const user = await this.findOne({email}) 

  if (!user) throw new CustomError('Incorrect email address', 400)

  // match password
  const pwMatch = await bcrypt.compare(password, user.password)

  if (!pwMatch) throw new CustomError('Incorrect password', 400)

  return user
}

userSchema.pre('save', function (next) {
  if (this.isModified('username')) this.username = this.username.toLowerCase() // perform the operation only if the value of the username was changed
  next()
})

const userModel = model('user', userSchema)

module.exports = userModel
