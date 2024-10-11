// import dependencies
const userModel = require('../../models/userModel')
const jwt = require('jsonwebtoken')

// env
const {ACCESS_TOKEN_SECRET} = require('../../config/env')

const verifyJWT = (req, res, next) => {
  const authHeader = req.headers['authorization']

  if (!authHeader) return res.sendStatus(401)

  const token = authHeader.split(' ')[1]

  console.log(`\nVERIFY JWT MIDDLEWARE 🔍\n 👉 Access token: ${token}`)
  
  jwt.verify(
    token,
    ACCESS_TOKEN_SECRET,
    // use a callback for error and decoded
    async (err, decoded) => {

      if (err !== null) console.log(`\nVERIFY JWT MIDDLEWARE 🔍\n 👉 Verify access token error: ${err}`)

      if (err) return res.sendStatus(403)

      // provide user id for downstream use
      req.user = await userModel.findOne({uuid: decoded.uuid}).select('id')

      next()
    }
  )
}

module.exports = verifyJWT
