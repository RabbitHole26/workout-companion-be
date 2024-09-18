// this class is used in combination with errorHandler middleware to define known errors and http status codes for error responses

class CustomError extends Error {
  constructor(message, code) {
    super(message) // custom error message
    this.code = code || 500 // custom error code or fallback
  }
}

module.exports = CustomError
