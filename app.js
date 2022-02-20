const child_process = require('child_process') // To be used later for running FFmpeg
const express = require('express')
const http = require('http')
var cors = require('cors')
const app = express()
const bodyParser = require('body-parser')
const path = require('path')
var xss = require('xss')
const { ffmpegConfig } = require('./ffmpegConfig')

var server = http.createServer(app)

const io = require('socket.io')(server, {
  cors: {
    origin: '*',
  },
})

// const accountSid = process.env.TWILIO_ACCOUNT_SID
// const authToken = process.env.TWILIO_AUTH_TOKEN
// const client = require('twilio')(accountSid, authToken)

app.use(cors())
app.use(bodyParser.json())

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(__dirname + '/build'))
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname + '/build/index.html'))
  })
}

app.set('port', process.env.PORT || 4001)

const recordRouter = require('./puppeteerStream')
app.use('/', recordRouter)

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

  let twitch =
    'rtmp://dfw.contribute.live-video.net/app/' + process.env.TWITCH_STREAM_KEY
  // FFMPEG LOGIC HERE

  const ffmpeg = child_process.spawn('ffmpeg', ffmpegConfig(twitch))

  // If FFmpeg stops for any reason, close the WebSocket connection.
  ffmpeg.on('close', (code, signal) => {
    console.log(
      'FFmpeg child process closed, code ' + code + ', signal ' + signal
    )
    // ws.terminate()
  })

  // Handle STDIN pipe errors by logging to the console.
  // These errors most commonly occur when FFmpeg closes and there is still
  // data to write.  If left unhandled, the server will crash.
  ffmpeg.stdin.on('error', (e) => {
    console.log('FFmpeg STDIN Error', e)
  })

  // FFmpeg outputs all of its messages to STDERR.  Let's log them to the console.
  ffmpeg.stderr.on('data', (data) => {
    console.log('FFmpeg STDERR:', data.toString())
  })

  // When data comes in from the WebSocket, write it to FFmpeg's STDIN.
  socket.on('message', (msg) => {
    console.log('DATA', msg)
    ffmpeg.stdin.write(msg)
  })

  // If the client disconnects, stop FFmpeg.
  socket.conn.on('close', (e) => {
    console.log('kill: SIGINT')
    ffmpeg.kill('SIGINT')
  })
})

server.listen(app.get('port'), () => {
  console.log('listening on', app.get('port'))
})

// twilio STUN AND TURN SERVER CREDENTIALS

// app.post('/api/twilio', async (req, res) => {
//   const baseUrl = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Tokens.json`

//   const token = await axios
//     .post(
//       baseUrl,
//       {},
//       {
//         auth: {
//           username: accountSid,
//           password: authToken,
//         },
//       }
//     )
//     .then((res) => {
//       return res.data
//     })
//     .catch((err) => {
//       return err
//     })

//   console.log(token)

//   res.json(token)
// })
