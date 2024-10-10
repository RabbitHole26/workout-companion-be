// import dependencies
const CustomError = require("../../classes/customError")

const errorHandler = (err, req, res, next) => {
  if (err) {
    console.log(`\nERROR HANDLER 🔍\nError: ${err}\nStack: ${err.stack}`)

    // check if error is a known error
    if (err instanceof CustomError) {
      return res.status(err.code).json({error: err.message})
    }
  }

  return res.status(500).json({error: 'Unexpected error ocurred'})
}

module.exports = errorHandler
