// import dependencies
const { validationResult } = require('express-validator')

const validator = (validationRuleSet) => {
  return async (req, res, next) => {
    // ! run all validation rules
    for (let rule of validationRuleSet) {
      await rule.run(req)
    }

    // ! extract validation results and convert them to array
    const errorsArray = validationResult(req).array()

    // ! transform errors array into desired format
    // step 1: accumulate messages by path
    const messageMap = errorsArray.reduce((acc, {path, msg}) => {
      if (!acc[path]) {
        acc[path] = []
      }

      acc[path].push(msg)

      return acc
    }, {})

    // step 2: convert messageMap into the desired array format
    const result = Object.keys(messageMap).map(path => ({
      path: path,
      message: messageMap[path]
    }))

    // ! return response or skip middleware
    if (result.length) {
      return res.status(400).json({error: result})
    } else {
      next()
    }
  }
}

module.exports = validator
