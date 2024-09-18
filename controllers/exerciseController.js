// import dependencies
const exerciseModel = require('../models/exerciseModel')
const CustomError = require('../classes/customError')

const getAllExercises = async (req, res, next) => {
  try {
    const {id} = req.user

    const allExercises = await exerciseModel
      .find({userId: id})
      .sort({createdAt: -1})  // sort exercises by createdAt date in descending order

    res.status(200).json(allExercises)
  } catch (error) {
    next(error)
  }
}

const getExercise = async (req, res, next) => {
  try {
    const {id} = req.params

    await exerciseModel.verifyExerciseId(id)

    const exercise = await exerciseModel.findById(id)

    if (!exercise) throw new CustomError('Exercise not found', 400)

    res.status(200).json(exercise)
  } catch (error) {
    next(error)
  }
}

const createExercise = async (req, res, next) => {

  try {
    const {id} = req.user
    const {title} = req.body

    await exerciseModel.exerciseAlreadyExists(title.toLowerCase())

    const exercise = await exerciseModel.create({
      userId: id,
      ...req.body
    })
    
    res.status(201).json(exercise)
  } catch (error) {
    next(error)
  }
}

const deleteExercise = async (req, res, next) => {
  try {
    const {id} = req.params
    
    await exerciseModel.verifyExerciseId(id)

    const exercise = await exerciseModel.findByIdAndDelete(id)

    if (!exercise) throw new CustomError('Exercise not found', 400)

    res.status(200).json(exercise)
  } catch (error) {
    next(error)
  }
}

const updateExercise = async (req, res, next) => {
  try {
    const {id} = req.params
    const data = req.body

    await exerciseModel.verifyExerciseId(id)
    await exerciseModel.verifyExerciseUpdate(id, data)

    const exercise = await exerciseModel.findByIdAndUpdate(
      id, 
      {...req.body},
      {returnDocument: 'after'} // return updated document
    )

    if (!exercise) throw new CustomError('Exercise not found', 400)

    res.status(200).json(exercise)
  } catch (error) {
    // return custom error for error code 11000 (unique constraint on exercise title which triggers on 'findByIdAndUpdate' method)
    if (error.code === 11000) return res.status(400).json({error: 'Exercise already exists'})
    next(error)
  }
}

module.exports = {
  getAllExercises,
  getExercise,
  createExercise,
  deleteExercise,
  updateExercise
}
