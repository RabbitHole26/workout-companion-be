// import dependencies
const express = require('express')
const validator = require('../middleware/validator/validatorMiddleware')
const exercise = require('../middleware/validator/validationRules/exerciseValidationRules')
const {
  // getAllExercises,
  // getExercise,
  createExercise,
  deleteExercise,
  updateExercise
} = require('../controllers/exerciseController')

// deploy router
const exerciseRouter = express.Router()

// // .../api/exercise/
// exerciseRouter.get('/', getAllExercises)

// // .../api/exercise/:id
// exerciseRouter.get('/:id', getExercise)

// .../api/exercise/add-new-exercise
exerciseRouter.post(
  '/add-new-exercise',
  validator(exercise),
  createExercise
)

// .../api/exercise/:id
exerciseRouter.delete('/:id', deleteExercise)

// .../api/exercise/:id
exerciseRouter.patch(
  '/:id',
  validator(exercise),
  updateExercise
)

module.exports = exerciseRouter
