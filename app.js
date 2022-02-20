const express = require('express')
const http = require('http')
var cors = require('cors')
const app = express()
const bodyParser = require('body-parser')
const path = require('path')

var server = http.createServer(app)

const io = require('socket.io')(server, {
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

app.set('port', process.env.PORT || 4001)

// API route to record webRTC meeting
const recordRouter = require('./puppeteerStream')
app.use('/', recordRouter)

let connections = {}
let timeOnline = {}

const getPathFromUrl = (url) => {
  return url.split('?')[0]
}

io.on('connection', (socket) => {
  socket.on('join-call', (path) => {
    let pathWoQuery = getPathFromUrl(path)
    if (connections[pathWoQuery] === undefined) {
      connections[pathWoQuery] = []
    }
    connections[pathWoQuery].push(socket.id)

    timeOnline[socket.id] = new Date()

    for (let a = 0; a < connections[pathWoQuery].length; ++a) {
      io.to(connections[pathWoQuery][a]).emit(
        'user-joined',
        socket.id,
        connections[pathWoQuery]
      )
    }

    console.log(pathWoQuery, connections[pathWoQuery])
    console.log(connections)
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

server.listen(app.get('port'), () => {
  console.log('listening on', app.get('port'))
})
