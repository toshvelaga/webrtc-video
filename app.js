const express = require('express')
const http = require('http')
var cors = require('cors')
const app = express()
const bodyParser = require('body-parser')
const path = require('path')
const { Server } = require('socket.io')
var server = http.createServer(app)
require('dotenv').config()

const accountSid = process.env.TWILIO_ACCOUNT_SID
const authToken = process.env.TWILIO_AUTH_TOKEN
const client = require('twilio')(accountSid, authToken)

const PORT = process.env.PORT || 4001
const WS_PORT = process.env.PORT || 4002

// REST API
app.listen(PORT, () => {
  console.log(`Listening on PORT ${PORT} for REST API requests`)
})

// SOCKET IO INIT
const io = new Server(WS_PORT, {
  /* options */
  cors: {
    origin: '*',
  },
})

app.use(cors())
app.use(bodyParser.json())

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(__dirname + '/build'))
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname + '/build/index.html'))
  })
}

let connections = {}
let timeOnline = {}

io.on('connection', (socket) => {
  socket.on('join-call', (path) => {
    if (connections[path] === undefined) {
      connections[path] = []
    }
    connections[path].push(socket.id)

    timeOnline[socket.id] = new Date()

    for (let a = 0; a < connections[path].length; ++a) {
      io.to(connections[path][a]).emit(
        'user-joined',
        socket.id,
        connections[path]
      )
    }

    console.log(path, connections[path])
  })

  socket.on('signal', (toId, message) => {
    io.to(toId).emit('signal', socket.id, message)
  })

  socket.on('disconnect', () => {
    var diffTime = Math.abs(timeOnline[socket.id] - new Date())
    var key
    for (const [k, v] of JSON.parse(
      JSON.stringify(Object.entries(connections))
    )) {
      for (let a = 0; a < v.length; ++a) {
        if (v[a] === socket.id) {
          key = k

          for (let a = 0; a < connections[key].length; ++a) {
            io.to(connections[key][a]).emit('user-left', socket.id)
          }

          var index = connections[key].indexOf(socket.id)
          connections[key].splice(index, 1)

          console.log(key, socket.id, Math.ceil(diffTime / 1000))

          if (connections[key].length === 0) {
            delete connections[key]
          }
        }
      }
    }
  })
})

// twilio STUN AND TURN SERVER CREDENTIALS
app.post('/api/twilio', async (req, res) => {
  client.tokens.create().then((token) => console.log(token.username))

  res.json({ msg: 'hello' })
})
