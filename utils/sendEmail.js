// import dependencies
const nodemailer = require('nodemailer')
const handlebars = require('handlebars')
const fs = require('fs')
const path = require('path')
const { 
  production, 
  EMAIL_HOST, 
  EMAIL_USERNAME, 
  EMAIL_PASSWORD,
  FROM_EMAIL
} = require('../config/env')

const sendEmail = async (email, subject, payload, template, res, next) => {
  try {
    // create reusable transporter object using the default SMTP transport
    const transporter = nodemailer.createTransport({
      host: EMAIL_HOST,
      port: production ? 465 : 587, // set port to 465 (implicit SSL) or 587 (explicit TLS)
      secure: production ? true : false, // use true for port 465 and false for port 587
      auth: {
        user: EMAIL_USERNAME,
        pass: EMAIL_PASSWORD
      }
    })

    const source = fs.readFileSync(path.join(__dirname, template), 'utf-8') // set the template file used
    const compiledTemplate = handlebars.compile(source) // compile template
    const options = () => {
      return {
        from: FROM_EMAIL,
        to: email,
        subject: subject,
        html: compiledTemplate(payload)
      }
    }

    // send email
    transporter.sendMail(options(), (error, info) => {
      if (error) {
        return next(error) // pass errors to errorHandler
      } else {
        return res.sendStatus(204) // no content to send, action successful
      }
    })
  } catch (error) {
    next(error) // pass errors to errorHandler
  }
}

module.exports = sendEmail
