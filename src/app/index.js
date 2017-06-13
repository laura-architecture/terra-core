module.exports.init = app => {
  // aliasing
  app.del = app.delete

  // app.get('/', (req, res, next) => res.sendFile('../../public/index.html'))

  require('./event').init(app)
  require('./network').init(app)
}
