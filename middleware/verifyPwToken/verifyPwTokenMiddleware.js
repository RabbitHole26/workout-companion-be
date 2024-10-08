const userModel = require('../../models/userModel')
const pwTokenModel = require('../../models/pwTokenModel')
const CustomError = require('../../classes/customError')
const bcrypt = require('bcryptjs')

const verifyPwToken = async (req, res, next) => {
  try {
    const {uuid, token} = req.body

    if (!token) throw new CustomError('Password reset link expired', 400)

    const user = await userModel.findOne({uuid: uuid})

    if (!user) throw new CustomError('User not found', 404)

    const pwResetToken = await pwTokenModel.findOne({userId: user._id})

    if (!pwResetToken) throw new CustomError('Please request a new password reset link', 404)

    const isValid = await bcrypt.compare(token, pwResetToken.token)

    if (!isValid) throw new CustomError('Please request a new password reset link', 400)

    req.user = user // attach user object to the request for downstream use
    req.pwResetToken = pwResetToken // attach pwResetToken object to the request for downstream use

    next()
  } catch (error) {
    next(error)
  }
}

module.exports = verifyPwToken
