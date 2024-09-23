// import dependencies
const userModel = require('../models/userModel')
const jwt = require('jsonwebtoken')
const {
  NODE_ENV,
  ACCESS_TOKEN_SECRET, 
  REFRESH_TOKEN_SECRET
} = require('../config/env')

const production = NODE_ENV === 'prod'

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

module.exports = {
  signup,
  login,
  logout,
  refreshToken
}
