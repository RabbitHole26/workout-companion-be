// import dependencies
const userModel = require('../models/userModel')
const pwTokenModel = require('../models/pwTokenModel')
const refreshTokenModel = require('../models/refreshTokenModel')
const CustomError = require('../classes/customError')
const { randomBytes, randomUUID } = require('crypto')
const sendEmail = require('../utils/sendEmail')
const sendCookie = require('../utils/sendCookie')
const signJwt = require('../utils/signJwt')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const {
  production,
  ORIGIN,
  REFRESH_TOKEN_SECRET
} = require('../config/env')

const signup = async (req, res, next) => {
  try {
    const data = req.body
    const {ip, deviceMetadata, uaFingerprint} = req

    const user = await userModel.createUser(data)
    const {_id, uuid} = user

    const refreshTokenUuid = randomUUID()

    // create tokens
    const accessToken = signJwt({uuid}, 'accessToken')
    const refreshToken = signJwt({refreshTokenUuid}, 'refreshToken')
    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10)

    // save refresh token in DB
    await refreshTokenModel.create({
      uuid: refreshTokenUuid,
      userId: _id,
      token: hashedRefreshToken,
      ipAddress: ip,
      deviceMetadata,
      uaFingerprint
    })

    // send refresh token via secure cookie
    sendCookie(res, 'jwt', refreshToken, next)

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
    const {ip, deviceMetadata, uaFingerprint} = req

    const user = await userModel.verifyLoginCredentials(email, password)
    const {_id, uuid} = user

    const refreshTokenUuid = randomUUID()

    // create tokens
    const accessToken = signJwt({uuid}, 'accessToken')
    const refreshToken = signJwt({refreshTokenUuid}, 'refreshToken')
    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10)

    // save refresh token in DB
    await refreshTokenModel.create({
      uuid: refreshTokenUuid,
      userId: _id,
      token: hashedRefreshToken,
      ipAddress: ip,
      deviceMetadata,
      uaFingerprint,
    })

    // send refresh token via secure cookie
    sendCookie(res, 'jwt', refreshToken, next)

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
  function deleteCookie (name) {
    res.clearCookie(
      name,
      {
        httpOnly: true,
        secure: production,
        sameSite: production ? 'None' : 'Lax'
      }
    )
  }

  try {
    const cookies = req.cookies

    // check if refresh token cookie exists
    if (!cookies?.jwt) return res.sendStatus(204) // no content to send, action successful
  
    const refreshToken = cookies.jwt

    jwt.verify(
      refreshToken,
      REFRESH_TOKEN_SECRET,
      async (err, decoded) => {
        if (err) {
          console.log(`LOGOUT 🔍\nJWT verify error: ${err}`)
          deleteCookie('jwt')
          return res.sendStatus(204)
        }

        const token = await refreshTokenModel.findOne({uuid: decoded.refreshTokenUuid})

        if (!token) {
          deleteCookie('jwt')
          return res.sendStatus(204) // early return if no refresh token
        } // delete cookie if refresh token not found in DB

        await token.deleteOne() // delete refresh token from DB

        deleteCookie('jwt') // delete cookie after deleting refresh token from DB
        res.sendStatus(204)
      }
    )
  } catch (error) {
    next(error)
  }
}

const refreshToken = async (req, res, next) => {
  try {
    const cookies = req.cookies
    const {ip, deviceMetadata, uaFingerprint} = req

    if (!cookies?.jwt) return res.sendStatus(401)

    const refreshToken = cookies.jwt

    jwt.verify(
      refreshToken,
      REFRESH_TOKEN_SECRET,
      async (err, decoded) => {
        if (err) return res.sendStatus(403)

        const token = await refreshTokenModel
          .findOne({uuid: decoded.refreshTokenUuid})
          .populate('userId')

        if (!token) return res.sendStatus(403)

        // compare stored refresh token with jwt extracted from the cookie
        const matchTokens = bcrypt.compare(token.token, refreshToken)

        if (!matchTokens) return res.sendStatus(403)
          
        console.log(`\nREFRESH TOKEN 🔍\n 👉 JWT token matched saved refresh token ✅`)
        
        // generate refresh token uuid
        const refreshTokenUuid = randomUUID()
        
        // create tokens
        const newAccessToken = signJwt({uuid: token.userId.uuid}, 'accessToken')
        const newRefreshToken = signJwt({refreshTokenUuid}, 'refreshToken')
        const hashedNewRefreshToken = await bcrypt.hash(newRefreshToken, 10)

        console.log(` 👉 Current refresh token: ${refreshToken}\n 👉 New access token: ${newAccessToken}\n 👉 New refresh token: ${newRefreshToken}`)

        // delete the current refresh token if exists
        await token.deleteOne()

        // save refresh token in DB
        await refreshTokenModel.create({
          uuid: refreshTokenUuid,
          userId: token.userId._id,
          token: hashedNewRefreshToken,
          ipAddress: ip,
          deviceMetadata,
          uaFingerprint
        })

        // send new refresh token via secure cookie
        sendCookie(res, 'jwt', newRefreshToken, next)

        // send response object with new access token
        res.status(201).json({newAccessToken})
      }
    )
  } catch (error) {
    next(error)
  }
}

const requestPasswordReset = async (req, res, next) => {
  try {
    const {email} = req.body
  
    const user = await userModel.findOne({email})
  
    if (!user) throw new CustomError('Email not registered', 400)
  
    let token = await pwTokenModel.findOne({userId: user._id}) // check if user has a token
  
    if (token) await token.deleteOne() // if token exists delete it
  
    let resetToken = randomBytes(32).toString('hex') // create reset token using Node.js crypto API
  
    // hash reset token
    const hashedResetToken = await bcrypt.hash(resetToken, 10)
  
    // save hashed reset token in DB
    await pwTokenModel.create({
      userId: user._id,
      token: hashedResetToken
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
    const pwHash = await bcrypt.hash(password, 10)

    // update password in the user document
    await userModel.findByIdAndUpdate(
      user._id,
      {password: pwHash}
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
