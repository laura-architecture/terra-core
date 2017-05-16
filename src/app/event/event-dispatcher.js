let io
const config = require('../../config')
const eventModel = require('./event-model')
const telosbConvertTemperature = require('../../module/sht1x-temperature')
const random = require('lodash/random')
const chalk = require('chalk')

/**
 * Initializes connections
 * @param {} app express app object 
 */
const init = (app) => {
    const server = require('http').createServer(app)

    io = require('socket.io')(server)
    io.on('connection', (socket) => {
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
const Event = (e) => {
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
        if (is_temperature) event.raw_temperature = e.d16[0] * random(1.3, 2.5)//e.d16[0]
    }

    return event
}

/**
 * Prepare, store and send the event through all channels
 * @param {*} raw_event Raw event data 
 */
const dispatchEvent = (raw_event) => {

    console.log(` ${chalk.bold('📥 Event received from mote ' + raw_event.source)}`)

    const event = Event(raw_event)

    // send to web client via socket.io
    io.emit('message', event)

    // parse gateway_time
    event.gateway_time = new Date(event.gateway_time)

    // save to database
    eventModel.addEvent(event)

    // TODO
    // convert(event)

    return event
}


const convert = (event) => {

    const networks = config.networks

    const functions = {
        'MDA100': () => 0, // TODO
        'TELOSB': telosbConvertTemperature
    }

    const data_is_temperature = event.id && event.id == config.id_temperature_event

    if (data_is_temperature) {

        networks.forEach((network) => {
            // node id not registered in config
            if (!network.mote_ids.includes(event.source)) return

            event.celsius = functions[network.model](event.d16[0])
        })
    }
}

module.exports.init = init
module.exports.dispatchEvent = dispatchEvent