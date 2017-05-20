let io
const config = require('../../config')
const eventModel = require('./event-model')
const random = require('lodash/random')
const chalk = require('chalk')
const mda100_temperature = require('../../helpers/mda100-temperature')
const sht1x_temperature = require('../../helpers/sht1x-temperature')

/**
 * Initializes connections
 * @param {} app express app object 
 */
const init = app => {
  const server = require('http').createServer(app)

  io = require('socket.io')(server)
  io.on('connection', socket => {
    console.log(
      `${chalk.bold(' 🔌 Socket.io: connected on port ' + config.socket_io_port)}`
    )
  })
  server.listen(config.socket_io_port)
}

/**
 * Mount the event following a certain standard
 * Works like a constructor
 * @param {Object} raw_data Raw event data 
 * @returns {Object} The event object
 */
const Event = e => {
  let event = {}

  if (e.port) event.port = e.port
  if (e.source) event.id_mote = e.source
  if (e.gateway_time) event.gateway_time = e.gateway_time
  if (e.d8 && e.d8[0]) event.counter = e.d8[0]
  if (e.d16 && e.d16[0]) {
    // TODO: add correct validation of sensor data type
    const is_temperature = true
    const is_luminosity = true

    if (is_luminosity) event.raw_luminosity = e.d16[0]
    if (is_temperature) event.raw_temperature = e.d16[0]
  }

  return event
}

/**
 * Prepare, store and send the event through all channels
 * @param {*} raw_event Raw event data 
 */
const dispatchEvent = raw_event => {
  console.log(
    ` ${chalk.bold('📥 Event received from mote ' + raw_event.source)}`
  )

  const event = Event(raw_event)

  // TODO
  convert(event)

  // send to web client via socket.io
  io.emit('message', event)

  // parse gateway_time
  event.gateway_time = new Date(event.gateway_time)

  // save to database
  eventModel.addEvent(event)

  return event
}

const convert = event => {
  const { raw_temperature, id_mote } = event
  const { networks } = config

  if (!raw_temperature) return

  let model = ''

  networks.forEach(network => {
    if (network.mote_ids.includes(id_mote)) {
      model = network.model
    }
  })

  switch (model) {
    case 'MDA100':
      event.temperature = mda100_temperature(raw_temperature)
      break
    case 'TELOSB':
      event.temperature = sht1x_temperature(raw_temperature)
      break
    default:
      event.temperature = null
  }
}

module.exports.init = init
module.exports.dispatchEvent = dispatchEvent
