const exerciseModel = require('../models/exerciseModel')

const searchExercise = async (req, res, next) => {
  try {
    const {id} = req.user
    const {searchTerm} = req.query
    let exercises = null
    const regex = new RegExp(searchTerm, 'i')

    // return all exercises if searchTerm isn't provided (user clears search field)
    if (!searchTerm) {
      exercises = await exerciseModel.find({userId: id})
      return res.status(200).json(exercises)
    }

    // attempt full text search if searchTerm length is higher than 3 characters
    if (searchTerm.length > 3) {
      exercises = await exerciseModel.find({
        $text: {$search: searchTerm}, // full text search on index title field
        userId: id
      })

      // if full text search yields results trigger early response return
      if (exercises.length > 0) {
        return res.status(200).json(exercises)
      } else {
        exercises = await exerciseModel.find({title: {$regex: regex}, userId: id})
      } // alternatively run a regex search and send response
    } else {
      exercises = await exerciseModel.find({title: {$regex: regex}, userId: id})
    } // attempt regex search if searchTerm length is lower or equal to 3 characters

    res.status(200).json(exercises)
  } catch (error) {
    next(error)
  }
}

module.exports = {
  searchExercise
}
