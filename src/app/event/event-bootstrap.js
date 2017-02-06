const zmq = require('zmq')
const subscriber = zmq.socket('sub')
const ports = [9002, 9003, 9004, 9005, 9006, 9007, 9008, 9009, 9010, 9011, 9012]

const bootstrap = (app) => {

    // socket io
    const server = require('http').createServer(app)
    const io = require('socket.io')(server)

    io.on('connection', (socket) => console.log(' -- user connected'))

    setTimeout(() => io.emit('message', 'hello'), 5000)

    server.listen(3000)

    // zmq
    subscriber.subscribe('event')
    ports.map(port => subscriber.connect('tcp://localhost:' + port))
    subscriber.monitor(500, 0)

    subscriber.on('subscribe', (fd, ep) => {
        console.log('-- connected to publisher')
    })

    subscriber.on('message', (channel, message) => {
        io.emit('message', JSON.parse(message.toString()))
        // console.log(' -- new message:', channel.toString(), message.toString())
    })
}



module.exports = bootstrap