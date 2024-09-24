// import dependencies
const userModel = require('../models/userModel')
const pwTokenModel = require('../models/pwTokenModel')
const CustomError = require('../classes/customError')
const crypto = require('crypto')
const sendEmail = require('../utils/sendEmail')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const {
  production,
  ORIGIN,
  ACCESS_TOKEN_SECRET, 
  REFRESH_TOKEN_SECRET,
} = require('../config/env')

const signup = async (req, res, next) => {
  try {
    const data = req.body

    const user = await userModel.createUser(data)

    const {uuid} = user

    // create access token
    const accessToken = jwt.sign(
      {uuid},
      ACCESS_TOKEN_SECRET,
      {expiresIn: '5m'}
    )

    // create refresh token
    const refreshToken = jwt.sign(
      {uuid},
      REFRESH_TOKEN_SECRET,
      {expiresIn: '1d'}
    )

    // save refresh token in db
    await userModel.findByIdAndUpdate(
      user._id,
      {refreshToken: refreshToken}
    )

    // send refreshToken via secure cookie
    res.cookie(
      'jwt',
      refreshToken,
      {
        httpOnly: true, // force secure cookie
        secure: production ? true : false,
        sameSite: production ? 'None' : 'Lax',
        maxAge: 24 * 60 * 60 * 1000 // 1 day
      }
    )

    // send response object with accessToken and user data
    res.status(201).json({
      username: user.username,
      avatarUrl: user.avatarUrl,
      accessToken
    })
  } catch (error) {
    next(error)
  }
}

const login = async (req, res, next) => {
  try {
    const {email, password} = req.body

    const user = await userModel.verifyLoginCredentials(
      email,
      password
    )

    const {uuid} = user

    // create access token
    const accessToken = jwt.sign(
      {uuid},
      ACCESS_TOKEN_SECRET,
      {expiresIn: '5m'}
    )

    // create refresh token
    const refreshToken = jwt.sign(
      {uuid},
      REFRESH_TOKEN_SECRET,
      {expiresIn: '1d'}
    )

    // save refresh token in db
    await userModel.findByIdAndUpdate(
      user._id,
      {refreshToken: refreshToken}
    )

    // send refreshToken via secure cookie
    res.cookie(
      'jwt',
      refreshToken,
      {
        httpOnly: true, // force secure cookie
        secure: production ? true : false,
        sameSite: production ? 'None' : 'Lax',
        maxAge: 24 * 60 * 60 * 1000 // 1 day
      }
    )

    // send response object with accessToken and other user data
    res.status(200).json({
      username: user.username,
      avatarUrl: user.avatarUrl,
      accessToken
    })
  } catch (error) {
    next(error)
  }
}

const logout = async (req, res, next) => {
  const cookies = req.cookies

  // check if refresh token cookie exists
  if (!cookies?.jwt) return res.sendStatus(204) // no content to send, action successful

  const refreshToken = cookies.jwt

  try {
    // find the user with refresh token
    const user = await userModel.findOne({
      refreshToken: refreshToken
    })

    if (!user) {
      // clear cookie if no user
      res.clearCookie(
        'jwt',
        {
          httpOnly: true,
          secure: production ? true : false,
          sameSite: production ? 'None' : 'Lax',
          maxAge: 0
        }
      )
      return res.sendStatus(204)
    }

    // delete the refresh token in db
    user.refreshToken = null
    user.save()

    // clear cookies if user
    res.clearCookie(
      'jwt',
      {
        httpOnly: true,
        secure: production ? true : false,
        sameSite: production ? 'None' : 'Lax',
        maxAge: 0
      }
    )

    res.sendStatus(204)
  } catch (error) {
    next(error)
  }
}

const refreshToken = async (req, res) => {
  const cookies = req.cookies

  if (!cookies?.jwt) return res.sendStatus(401)

  const refreshToken = cookies.jwt

  const user = await userModel.findOne({
    refreshToken: refreshToken
  })

  if (!user) return res.sendStatus(403)

  jwt.verify(
    refreshToken,
    REFRESH_TOKEN_SECRET,
    (err, decoded) => {
      if (err || user.uuid !== decoded.uuid) return res.sendStatus(403)
      
      const accessToken = jwt.sign(
        {uuid: decoded.uuid},
        ACCESS_TOKEN_SECRET,
        {expiresIn: '5m'}
      )

      console.log('\nnewAccessToken: ', accessToken)

      res.status(201).json({accessToken})
    }
  )
}

const requestPasswordReset = async (req, res, next) => {
  try {
    const {email} = req.body
  
    const user = await userModel.findOne({email})
  
    if (!user) throw new CustomError('Email not registered', 400)
  
    let token = await pwTokenModel.findOne({userId: user._id}) // check if user has a token
  
    if (token) await token.deleteOne() // if token exists delete it
  
    let resetToken = crypto.randomBytes(32).toString('hex') // create reset token using Node.js crypto API
  
    // hash resetToken
    const salt = await bcrypt.genSalt(10)
    const hash = await bcrypt.hash(resetToken, salt)
  
    // save hashed resetToken in DB
    await pwTokenModel.create({
      userId: user._id,
      token: hash,
      createdAt: Date.now()
    })

    const link = `${ORIGIN}/password-reset?token=${resetToken}&uuid=${user.uuid}` // define reset password link containing reset token and user uuid
    sendEmail(
      user.email, // email
      'Password Reset Request', // subject
      {
        name: user.username[0].toUpperCase() + user.username.slice(1), 
        link: link
      }, // payload
      './template/requestPasswordReset.handlebars', // handlebars template
      res, // pass res object
      next // past next fn
    )
  } catch (error) {
    next(error)
  }
}

const passwordReset = async (req, res, next) => {
  try {
    const {uuid, token, password} = req.body

    const user = await userModel.findOne({uuid: uuid}) // find user by uuid

    if (!user) throw new CustomError('User not found', 404)

    const pwResetToken = await pwTokenModel.findOne({userId: user._id}) // find pw reset token by user _id
    
    if (!pwResetToken) throw new CustomError('Please request a new password reset link', 404)

    const isValid = await bcrypt.compare(token, pwResetToken.token) // compare FE token with DB token

    if (!isValid) throw new CustomError('Please request a new password reset link', 400)

    // hash new password
    const salt = await bcrypt.genSalt(10)
    const pwHash = await bcrypt.hash(password, salt)

    // update password in the user document
    await userModel.findByIdAndUpdate(
      user._id,
      {$set: {password: pwHash}},
      {new: true}
    )

    sendEmail(
      user.email, // email
      'Password Reset Successful', // subject
      {
        name: user.username[0].toUpperCase() + user.username.slice(1)
      }, // payload
      './template/passwordReset.handlebars', // handlebars template
      res, 
      next
    )
    
    await pwResetToken.deleteOne() // delete the password reset token when operation is successful
  } catch (error) {
    next(error)
  }
}

module.exports = {
  signup,
  login,
  logout,
  refreshToken,
  requestPasswordReset,
  passwordReset
}
