// import dependencies
const { Schema, model } = require('mongoose')
const checkIfMongoId = require('../utils/checkIfMongoId')
const CustomError = require('../classes/customError')

const exerciseSchema = new Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
  },
  reps: {
    type: Number,
    required: [true, 'Reps are required']
  },
  weight: {
    type: Number,
    required: [true, 'Weight is required']
  },
  userId: {
    type: Schema.Types.ObjectId,
    required: true,
  }
}, {
  timestamps: true
})

// prevent duplication of exercises by title per user
exerciseSchema.index(
  {title: 1, userId: 1}, // define compound index where title comes first and userId second 
  {unique: true} // the combination of title and userId is unique
)

exerciseSchema.index({title: 'text'}) // add text index to title field for the full text search

exerciseSchema.statics.verifyExerciseId = function (id) {
  if (!checkIfMongoId(id)) throw new CustomError('Provided exercise ID is incorrect', 400)
}

exerciseSchema.statics.verifyExerciseUpdate = async function (id, data) {
  const exerciseExists = await this.findById(id)

  if (!exerciseExists) throw new CustomError('Provided exercise ID does not match any exercise', 400)

  const exerciseObject = exerciseExists.toObject()

  const isDifferent = Object.keys(data)
    .some(k => String(exerciseObject[k]).toLowerCase() !== String(data[k]).toLowerCase())

  if (!isDifferent) throw new CustomError('No changes were made', 400)
}

// delete userId field when serializing response object to JSON (prevent userId from being sent in any API response when calling res.json()) 
exerciseSchema.set('toJSON', {
  transform: function (
    doc, // document
    ret, // JSON representation object
    options
  ) {
    delete ret.userId // delete userId field from the JSON representation object
    return ret // return transformed object
  }
})

exerciseSchema.pre('save', function (next) {
  this.title = this.title.toLowerCase()
  next()
})

const exerciseModel = model('exercise', exerciseSchema)

exerciseModel.createIndexes() // create indexes on app startup

module.exports = exerciseModel
