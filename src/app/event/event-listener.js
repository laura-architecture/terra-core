const zmq = require('zmq')
const subscriber = zmq.socket('sub')
const moment = require('moment')
const sample = require('lodash/sample')
const random = require('lodash/random')
const dispatcher = require('./event-dispatcher')
const config = require('../../config')

const ports = config.networks.map(net => net.port)

const init = app => {
  subscriber.subscribe('event')

  // TODO: localhost should be fetch from config
  ports.map(port => subscriber.connect('tcp://localhost:' + port))

  // subscriber.monitor(500, 0)

  subscriber.on('subscribe', (fd, ep) =>
    console.log('-- connected to publisher')
  )

  subscriber.on('message', (channel, message) => {
    let m = JSON.parse(message.toString())

    dispatcher.dispatchEvent(m)

    console.log(' [New Message]: ', channel.toString(), message.toString())
  })
}

const initSimulation = app => {
  const max_interval = config.simulation_interval
  let counter = 0

  setInterval(() => {
    const fake_event = {
      id: random(1, 2),
      port: random(9002, 9005),
      source: 20, //random(10, 34), // should match ids from config file
      gateway_time: new Date().getTime() - random(400, 500),
      d8: [counter++, 0, 0, 0],
      d16: [random(490, 510), 0, 0, 0],
      target: 30
    }
    
    dispatcher.dispatchEvent(fake_event)
  }, random(max_interval - 500, max_interval))
}

module.exports.init = init
module.exports.initSimulation = initSimulation
