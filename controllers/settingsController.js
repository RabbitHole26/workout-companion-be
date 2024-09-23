// import dependencies
const CustomError = require('../classes/customError')
const cloudinary = require('../config/cloudinary')
const userModel = require('../models/userModel')

const uploadAvatar = async (req, res, next) => {
  try {
    const {file} = req
    const {id} = req.user

    if (!file) throw new CustomError('Please select a file', 400)

    console.log('\nfileInUploadAvatar: ', file)

    // find user
    const user = await userModel.findById(id)

    // construct public_id using uuid
    const publicId = `avatar_${user.uuid}`
    // extract the image file format
    const format = file.mimetype.split('/')[1]

    // use the upload_stream method to upload image as buffer
    cloudinary.uploader.upload_stream(
      {
        resource_type: 'image',
        format: format, 
        public_id: publicId,
        folder: 'workout-companion', // specify upload folder 
        overwrite: true, // overwrite existing avatar image
        transformation: [ // transform the image
          {
            gravity: 'face', // auto detect face
            height: 50, 
            width: 50, 
            crop: 'thumb', // crop to thumbnail
            quality: 'auto'
          }
        ]
      },
      async (error, result) => {
        if (error) return next(new CustomError('File upload failed', 500))

        try {
          // update avatarUrl in user document
          await userModel.findByIdAndUpdate(
            id,
            {avatarUrl: result.secure_url}
          )

          res.status(200).json(result.secure_url)
        } catch (error) {
          return next(error)
        }
      }
    ).end(file.buffer) // send the buffer and end the stream
  } catch (error) {
    next(error)
  }
}

module.exports = uploadAvatar
