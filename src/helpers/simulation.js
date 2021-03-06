const random = require('lodash/random')
const app = require('../index')

let i = 0

const values = {
  c1: [-10, -9, -8, -7, -6, -5, -4, -3, -2, -1, 0],
  c2: [
    -17,
    -15,
    -13,
    -11,
    -9,
    -7,
    -5,
    -3,
    -1,
    0,
    1,
    3,
    5,
    7,
    9,
    11,
    13,
    11,
    9,
    7,
    5,
    3,
    1,
    -1,
    -3,
    -5,
    -7,
    -9,
    -13,
    -15,
  ],
  c3: [-14, -12, -10, -8, -7, -6, -4, -2, 0, 2, 4, 6, 8, 9, 10, 12, 14, 16, 18, 20, 22, 24, 26],
  temp1: [
    { lat: -20.318518, lng: -40.308714 },
    { lat: -20.318518, lng: -40.308714 },
    { lat: -20.318518, lng: -40.308714 },
    { lat: -20.318518, lng: -40.308714 },
    // Starts moving
    { lat: -20.316747, lng: -40.303823 },
    { lat: -20.316425, lng: -40.298847 },
    { lat: -20.31554, lng: -40.294729 },
    { lat: -20.314172, lng: -40.291469 },
    { lat: -20.306203, lng: -40.291898 },
    { lat: -20.297911, lng: -40.291212 },
    { lat: -20.288573, lng: -40.291126 },
    { lat: -20.280361, lng: -40.288383 },
    { lat: -20.271344, lng: -40.28641 },
    { lat: -20.267801, lng: -40.293788 },
    { lat: -20.259105, lng: -40.291987 },
    { lat: -20.248396, lng: -40.285122 },
    { lat: -20.239135, lng: -40.279031 },
    { lat: -20.230115, lng: -40.273453 },
    { lat: -20.221256, lng: -40.270364 },
    { lat: -20.209255, lng: -40.269674 },
    { lat: -20.194675, lng: -40.268816 },
    { lat: -20.183236, lng: -40.2665 },
    { lat: -20.170185, lng: -40.269331 },
    // Returning
    { lat: -20.176872, lng: -40.265982 },
    { lat: -20.184364, lng: -40.266925 },
    { lat: -20.188521, lng: -40.267585 },
    { lat: -20.194804, lng: -40.269472 },
    { lat: -20.203826, lng: -40.268957 },
    { lat: -20.213975, lng: -40.269301 },
    { lat: -20.220579, lng: -40.269301 },
    { lat: -20.228311, lng: -40.270673 },
    { lat: -20.234915, lng: -40.274791 },
    { lat: -20.241518, lng: -40.280625 },
    { lat: -20.250376, lng: -40.289204 },
    { lat: -20.259717, lng: -40.292121 },
    { lat: -20.265676, lng: -40.297269 },
    { lat: -20.276626, lng: -40.302073 },
    { lat: -20.288702, lng: -40.303618 },
    { lat: -20.296462, lng: -40.300735 },
    { lat: -20.304432, lng: -40.303395 },
    { lat: -20.310791, lng: -40.302194 },
    { lat: -20.316264, lng: -40.305454 },
    { lat: -20.318518, lng: -40.308714 },
    { lat: -20.318518, lng: -40.308714 },
  ],
}

function createTemperatureEvent() {
  return {
    id: random(1, 2),
    port: random(9002, 9005),
    id_mote: random(20, 29),
    gateway_time: new Date().getTime() - random(400, 500),
    counter: i++,
    temperature: !['c1', 'c2', 'c3'].includes(process.env.NODE_ENV)
      ? values.c1.shift()
      : values[process.env.NODE_ENV].shift(),
  }
}

function createLocationEvent() {
  return {
    id: random(1, 2),
    port: random(9002, 9005),
    id_mote: random(20, 29), // id_mote: 20,
    gateway_time: new Date().getTime() - random(400, 500),
    counter: i++,
    location: values.temp1.shift(),
  }
}

module.exports = { values, createLocationEvent, createTemperatureEvent }
