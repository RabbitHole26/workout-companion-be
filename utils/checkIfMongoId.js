// import dependencies
const mongoose = require('mongoose')

const checkIfMongoId = (id) => {
  return mongoose.Types.ObjectId.isValid(id)
}

module.exports = checkIfMongoId
