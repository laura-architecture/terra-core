const db = require('../../helpers/fake-db')

const getEvents = (req, res, next) => {
  res.send(db.events)
}

module.exports = {
  getEvents,
}
