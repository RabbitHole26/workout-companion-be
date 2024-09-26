// import dependencies
const express = require('express')
const {
  searchExercise
} = require('../controllers/searchController')

// deploy router
const searchRouter = express.Router()

// .../api/search/exercises
searchRouter.get('/exercises', searchExercise)

module.exports = searchRouter
