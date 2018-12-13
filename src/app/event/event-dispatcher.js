let io
const config = require('../../config')
const eventModel = require('./event-model')
const random = require('lodash/random')
const chalk = require('chalk')
const mda100_temperature = require('../../helpers/mda100-temperature')
const sht1x_temperature = require('../../helpers/sht1x-temperature')
const moment = require('moment')
const {
  createTemperatureEvent,
  createLocationEvent,
  values: simulationValues,
} = require('../../helpers/simulation')
const db = require('../../helpers/fake-db')
const axios = require('axios')

// Helpers for toggling the attending status
let iteration = 0
let currentStatus = 'BUSY'
let tttValue = 0

/**
 * Initializes connections
 * @param {} app express app object
 */
const init = app => {
  const server = require('http').createServer(app)

  io = require('socket.io')(server)
  io.on('connection', socket => {
    console.log(`${chalk.bold(' 🔌 Socket.io: connected on port ' + config.socket_io_port)}`)
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
    const { id_temperature_event, id_luminosity_event } = config

    // TODO: add correct validation of sensor data type
    const is_temperature = e.id == id_temperature_event
    const is_luminosity = e.id == id_luminosity_event

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
  const event = Event(raw_event)

  convert(event)

  // send to web client via socket.io
  // io.emit('message', event)

  const temperatureEvent = createTemperatureEvent()
  const locationEvent = createLocationEvent()

  db.events.push(temperatureEvent)
  db.events.push(locationEvent)

  io.emit('message', temperatureEvent)
  io.emit('message', locationEvent)

  // console.log(` ${chalk.bold('📥:', JSON.stringify(temperatureEvent))}`)
  // console.log(` ${chalk.bold('📥:', JSON.stringify(locationEvent))}`)
  console.log(` ${chalk.bold('📥: i: ', iteration)}`)

  const temperaturePayload = {
    timestamp: Date.now(),
    entries: { value: temperatureEvent.temperature },
  }

  currentStatus === 'BUSY' ? (currentStatus = 'ATTENDING') : (currentStatus = 'BUSY')

  // tttValue === 0 ? (tttValue = 300) : (tttValue = 0)
  tttValue === 0

  if (process.env.NODE_ENV === 'c1') {
    axios
      .post('http://localhost:9999/entities/2/contexts/3/values', temperaturePayload)
      .then(res => console.log('Sent temperature: ' + temperatureEvent.temperature))

    if (simulationValues.c1.length === 0) process.exit(0)
  }

  if (process.env.NODE_ENV === 'c2') {
    const tttPayload = {
      timestamp: Date.now(),
      entries: { ttt: tttValue },
    }

    const statusPayload = {
      timestamp: Date.now(),
      entries: { status: currentStatus },
    }

    if (iteration === 0) {
      axios
        .post('http://localhost:9999/relations/7/values', tttPayload)
        .then(() => console.log('Sent ttt: ' + tttValue))
    }

    if(iteration === 5){
      tttValue = 300

      axios
        .post('http://localhost:9999/relations/7/values', tttPayload)
        .then(() => console.log('Sent ttt: ' + tttValue))
    }

    if (iteration % 5 === 0) {
      axios
        .post('http://localhost:9999/relations/6/values', statusPayload)
        .then(() => console.log('Changed status to: ' + currentStatus))
    }

    if (iteration === 15) process.exit(0)
  }

  iteration++

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
