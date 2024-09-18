const mongoose = require('mongoose')
const { PORT, DB_URI } = require('./env')

const connectToDb = (app) => {
  const url = `http://localhost:${PORT}`
  
  mongoose.connect(DB_URI)
  .then(
    app.listen(PORT, () => {
      console.log(`Server started and is listening on: ${url}`)
    })
  )
  .catch(error => console.log(`Error connecting to DB: ${error.stack}`))
}

module.exports = connectToDb
