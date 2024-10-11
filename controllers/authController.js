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
  ACCESS_TOKEN_EXPIRY_PROD,
  ACCESS_TOKEN_EXPIRY_DEV,
  REFRESH_TOKEN_SECRET,
  REFRESH_TOKEN_EXPIRY_PROD,
  REFRESH_TOKEN_EXPIRY_DEV,
  COOKIE_MAXAGE_PROD,
  COOKIE_MAXAGE_DEV
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
      {
        expiresIn: production 
          ? ACCESS_TOKEN_EXPIRY_PROD 
          : ACCESS_TOKEN_EXPIRY_DEV
      }
    )

    // create refresh token
    const refreshToken = jwt.sign(
      {uuid},
      REFRESH_TOKEN_SECRET,
      {
        expiresIn: production 
          ? REFRESH_TOKEN_EXPIRY_PROD
          : REFRESH_TOKEN_EXPIRY_DEV
      }
    )

    // save refresh token in DB
    await userModel.findByIdAndUpdate(
      user._id,
      {refreshToken: refreshToken}
    )

    // send refresh token via secure cookie
    res.cookie(
      'jwt',
      refreshToken,
      {
        httpOnly: true, // force secure cookie
        secure: production ? true : false,
        sameSite: production ? 'None' : 'Lax',
        maxAge: production
          ? COOKIE_MAXAGE_PROD
          : COOKIE_MAXAGE_DEV
      }
    )

    // send response object with access token and user data
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
      {
        expiresIn: production 
          ? ACCESS_TOKEN_EXPIRY_PROD 
          : ACCESS_TOKEN_EXPIRY_DEV
      }
    )

    // create refresh token
    const refreshToken = jwt.sign(
      {uuid},
      REFRESH_TOKEN_SECRET,
      {
        expiresIn: production 
          ? REFRESH_TOKEN_EXPIRY_PROD
          : REFRESH_TOKEN_EXPIRY_DEV
      }
    )

    // save refresh token in DB
    await userModel.findByIdAndUpdate(
      user._id,
      {refreshToken: refreshToken}
    )

    // send refresh token via secure cookie
    res.cookie(
      'jwt',
      refreshToken,
      {
        httpOnly: true, // force secure cookie
        secure: production ? true : false,
        sameSite: production ? 'None' : 'Lax',
        maxAge: production
        ? COOKIE_MAXAGE_PROD
        : COOKIE_MAXAGE_DEV
      }
    )

    // send response object with access token and other user data
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

    // delete the refresh token in DB
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
    async (err, decoded) => {
      if (err || user.uuid !== decoded.uuid) return res.sendStatus(403)
      
      // create new accessToken
      const newAccessToken = jwt.sign(
        {uuid: decoded.uuid},
        ACCESS_TOKEN_SECRET,
        {
          expiresIn: production 
            ? ACCESS_TOKEN_EXPIRY_PROD 
            : ACCESS_TOKEN_EXPIRY_DEV
        }
      )

      // create new refreshToken
      const newRefreshToken = jwt.sign(
        {uuid: user.uuid},
        REFRESH_TOKEN_SECRET,
        {
          expiresIn: production 
            ? REFRESH_TOKEN_EXPIRY_PROD
            : REFRESH_TOKEN_EXPIRY_DEV
        }
      )

      console.log(`\nREFRESH TOKEN 🔍\nCurrent refresh token: ${user.refreshToken}\nNew access token: ${newAccessToken}\nNew refresh token: ${newRefreshToken}`)

      // save new refresh token in DB
      user.refreshToken = newRefreshToken
      await user.save()

      console.log(`Updated refresh token: ${user.refreshToken}`)

      // send new refresh token via secure cookie
      res.cookie(
        'jwt',
        newRefreshToken,
        {
          httpOnly: true, // force secure cookie
          secure: production ? true : false,
          sameSite: production ? 'None' : 'Lax',
          maxAge: production
            ? COOKIE_MAXAGE_PROD
            : COOKIE_MAXAGE_DEV
        }
      )

      // send response object with new access token
      res.status(201).json({newAccessToken})
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
  
    // hash reset token
    const salt = await bcrypt.genSalt(10)
    const hash = await bcrypt.hash(resetToken, salt)
  
    // save hashed reset token in DB
    await pwTokenModel.create({
      userId: user._id,
      token: hash
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

const verifyPasswordToken = async (req, res, next) => {
  try {
    res.sendStatus(200)
  } catch (error) {
    next(error)
  }
}

const passwordReset = async (req, res, next) => {
  try {
    const {uuid, token, password} = req.body

    // access obj passed by the middleware
    const user = req.user
    const pwResetToken = req.pwResetToken

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
  verifyPasswordToken,
  requestPasswordReset,
  passwordReset
}
