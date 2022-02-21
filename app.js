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
// connections example: { http://localhost:8000/demo [ 'msZkzHGsJ9pd3IzHAAAB', '748f9D8giwRR5uXtAAAD' ] }
let timeOnline = {}

const removeQueryParamFromUrl = (url) => {
  return url.split('?')[0]
}

io.on('connection', (socket) => {
  socket.on('join-call', (path) => {
    //editedPath is without query params
    const editedPath = removeQueryParamFromUrl(path)

    console.log(path.includes('?ghost'))
    // if no connection array exists for this path, create new one with empty array
    if (connections[editedPath] === undefined) {
      connections[editedPath] = []
    }
    // push socket.id into array
    connections[editedPath].push(socket.id)

    timeOnline[socket.id] = new Date()

    // loop over length of array in room which contains users
    for (let a = 0; a < connections[editedPath].length; ++a) {
      // emit to each user
      io.to(connections[editedPath][a]).emit(
        'user-joined',
        socket.id,
        connections[editedPath]
      )
    }

    console.log(editedPath, connections[editedPath])
    console.log(connections)
  })

  socket.on('signal', (toId, message) => {
    io.to(toId).emit('signal', socket.id, message)
  })

  console.log(JSON.parse(JSON.stringify(Object.entries(connections))))

  socket.on('disconnect', () => {
    var diffTime = Math.abs(timeOnline[socket.id] - new Date())
    var key
    // loop over keys and values of connections object which is now an array
    for (const [k, v] of JSON.parse(
      JSON.stringify(Object.entries(connections))
    )) {
      for (let a = 0; a < v.length; ++a) {
        if (v[a] === socket.id) {
          key = k

          for (let a = 0; a < connections[key].length; ++a) {
            // emit to all other users in room that user with socket.id has left
            io.to(connections[key][a]).emit('user-left', socket.id)
          }

          var index = connections[key].indexOf(socket.id)
          connections[key].splice(index, 1)

          console.log(key, socket.id, Math.ceil(diffTime / 1000))
          // delete room if no users are present
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
