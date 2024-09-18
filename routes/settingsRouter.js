// import dependencies
const express = require('express')
const upload = require('../config/multer')
const uploadAvatar = require('../controllers/settingsController')

// deploy router
const settingsRouter = express.Router()

settingsRouter.post(
  '/upload-avatar', 
  upload.single('avatar'), // add multer .single() method
  uploadAvatar
)

module.exports = settingsRouter
