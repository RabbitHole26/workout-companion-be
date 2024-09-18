// import dependencies
const { Schema, model } = require('mongoose')
const CustomError = require('../classes/customError')
const bcrypt = require('bcryptjs')
const {v4: uuidv4} = require('uuid')

const userSchema = new Schema({
  uuid: {
    type: String,
    unique: true
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
    uuid: uuidv4(),
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
  this.username = this.username.toLowerCase()
  this.email = this.email.toLowerCase()
  next()
})

const userModel = model('user', userSchema)

module.exports = userModel
