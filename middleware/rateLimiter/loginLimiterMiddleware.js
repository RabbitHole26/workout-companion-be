const rateLimit = require('express-rate-limit')

const loginLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5, // limit to 5 login requests per window (per minute)
  message: {
    msg: 'Too many login attempts from this IP, please try again later'
  },
  standardHeaders: true, // Return rate limit info in the 'RateLimit-*' headers
  legacyHeaders: false // disable the 'X-RateLimit-*' headers
})

module.exports = loginLimiter
