// import dependencies
const multer = require('multer')

// configure multer
// store files passed in formData in memory instead of saving them
const memStorage = multer.memoryStorage()
const upload = multer({storage: memStorage})

module.exports = upload
