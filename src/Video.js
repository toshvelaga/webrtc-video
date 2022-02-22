import React, { useState, useEffect, useRef } from 'react'
import io from 'socket.io-client'
import faker from 'faker'

import { IconButton, Badge, Input, Button } from '@material-ui/core'
import VideocamIcon from '@material-ui/icons/Videocam'
import VideocamOffIcon from '@material-ui/icons/VideocamOff'
import MicIcon from '@material-ui/icons/Mic'
import MicOffIcon from '@material-ui/icons/MicOff'
import ScreenShareIcon from '@material-ui/icons/ScreenShare'
import StopScreenShareIcon from '@material-ui/icons/StopScreenShare'
import CallEndIcon from '@material-ui/icons/CallEnd'
import { silence, black, changeCssVideos } from './utils'

import { Row } from 'reactstrap'
import 'bootstrap/dist/css/bootstrap.css'
import './Video.css'

import axios from 'axios'
import API from './api/api'

const server_url =
  process.env.NODE_ENV === 'production'
    ? 'https://video-meeting-socket.herokuapp.com'
    : 'http://localhost:4001'

const Video = (props) => {
  const localVideoref = useRef(null)
  const stream = useRef(null)

  const [video, setvideo] = useState(true)
  const [audio, setaudio] = useState(true)
  const [screen, setscreen] = useState(false)
  const [screenAvailable, setscreenAvailable] = useState(true)
  const [askForUsername, setaskForUsername] = useState(true)
  const [username, setusername] = useState(faker.internet.userName())
  const [iceServers, seticeServers] = useState([])

  const [streams, setstreams] = useState([])

  var connections = {}

  var socket = null
  var socketId = null
  var elms = 0

  const peerConnectionConfig = {
    iceServers: iceServers,
  }

  useEffect(() => {
    axios
      .post(
        'https://us-central1-callapp-9d817.cloudfunctions.net/makeTwilioWebRTC'
      )
      .then((res) => {
        seticeServers(res.data.ice_servers)
      })
      .catch((err) => console.log(err))
  }, [])

  useEffect(() => {
    if (!window.location.href.includes('ghost')) {
      getPermissions()
    }
  }, [])

  const getPermissions = async () => {
    await navigator.mediaDevices
      .getUserMedia({
        video: true,
        audio: true,
      })
      .then((stream) => {
        streams.push(stream)
        window.localStream = stream
        localVideoref.current.srcObject = stream
      })
      .catch((e) => console.log(e))
  }

  const getMedia = () => {
    getUserMedia()
    connectToSocketServer()
  }

  const getUserMedia = () => {
    navigator.mediaDevices
      .getUserMedia({ video: video, audio: true })
      .then((stream) => {
        getUserMediaSuccess(stream)
      })
      .catch((e) => console.log(e))
  }

  const getUserMediaSuccess = (stream) => {
    try {
      window.localStream.getTracks().forEach((track) => track.stop())
    } catch (e) {
      console.log(e)
    }

    streams.push(window.localStream)
    window.localStream = stream
    localVideoref.current.srcObject = stream

    for (let id in connections) {
      if (id === socketId) continue

      connections[id].addStream(window.localStream)

      connections[id].createOffer().then((description) => {
        connections[id]
          .setLocalDescription(description)
          .then(() => {
            socket.emit(
              'signal',
              id,
              JSON.stringify({ sdp: connections[id].localDescription })
            )
          })
          .catch((e) => console.log(e))
      })
    }

    stream.getTracks().forEach(
      (track) =>
        (track.onended = () => {
          setvideo(false)
          setaudio(false)

          try {
            let tracks = localVideoref.current.srcObject.getTracks()
            tracks.forEach((track) => track.stop())
          } catch (e) {
            console.log(e)
          }

          // let blackSilence = (...args) =>
          //   new MediaStream([black(...args), silence()])
          // window.localStream = blackSilence()
          // localVideoref.current.srcObject = window.localStream

          // for (let id in connections) {
          //   connections[id].addStream(window.localStream)

          //   connections[id].createOffer().then((description) => {
          //     connections[id]
          //       .setLocalDescription(description)
          //       .then(() => {
          //         socket.emit(
          //           'signal',
          //           id,
          //           JSON.stringify({
          //             sdp: connections[id].localDescription,
          //           })
          //         )
          //       })
          //       .catch((e) => console.log(e))
          //   })
          // }
        })
    )
  }

  const getDislayMedia = () => {
    if (screen) {
      if (navigator.mediaDevices.getDisplayMedia) {
        navigator.mediaDevices
          .getDisplayMedia({ video: true, audio: true })
          .then((stream) => getDislayMediaSuccess(stream))
          .catch((e) => console.log(e))
      }
    }
  }

  const getDislayMediaSuccess = (stream) => {
    try {
      window.localStream.getTracks().forEach((track) => track.stop())
    } catch (e) {
      console.log(e)
    }

    window.localStream = stream
    localVideoref.current.srcObject = stream

    for (let id in connections) {
      if (id === socketId) continue

      connections[id].addStream(window.localStream)

      connections[id].createOffer().then((description) => {
        connections[id]
          .setLocalDescription(description)
          .then(() => {
            socket.emit(
              'signal',
              id,
              JSON.stringify({ sdp: connections[id].localDescription })
            )
          })
          .catch((e) => console.log(e))
      })
    }

    stream.getTracks().forEach(
      (track) =>
        (track.onended = () => {
          setscreen(false)

          try {
            let tracks = localVideoref.current.srcObject.getTracks()
            tracks.forEach((track) => track.stop())
          } catch (e) {
            console.log(e)
          }

          let blackSilence = (...args) =>
            new MediaStream([black(...args), silence()])
          window.localStream = blackSilence()
          localVideoref.current.srcObject = window.localStream

          getUserMedia()
        })
    )
  }

  console.log(connections)

  const gotMessageFromServer = (fromId, message) => {
    var signal = JSON.parse(message)

    if (fromId !== socketId) {
      if (signal.sdp) {
        connections[fromId]
          .setRemoteDescription(new RTCSessionDescription(signal.sdp))
          .then(() => {
            if (signal.sdp.type === 'offer') {
              connections[fromId]
                .createAnswer()
                .then((description) => {
                  connections[fromId]
                    .setLocalDescription(description)
                    .then(() => {
                      socket.emit(
                        'signal',
                        fromId,
                        JSON.stringify({
                          sdp: connections[fromId].localDescription,
                        })
                      )
                    })
                    .catch((e) => console.log(e))
                })
                .catch((e) => console.log(e))
            }
          })
          .catch((e) => console.log(e))
      }

      if (signal.ice) {
        connections[fromId]
          .addIceCandidate(new RTCIceCandidate(signal.ice))
          .catch((e) => console.log(e))
      }
    }
  }

  const connectToSocketServer = () => {
    socket = io.connect(server_url, { secure: true })

    socket.on('signal', gotMessageFromServer)

    socket.on('connect', () => {
      socket.emit('join-call', window.location.href)
      socketId = socket.id

      // REMOVE VIDEO WHEN USER LEAVES
      socket.on('user-left', (id) => {
        let video = document.querySelector(`[data-socket="${id}"]`)
        if (video !== null) {
          elms--
          //remove video from DOM
          video.parentNode.removeChild(video)

          let main = document.getElementById('main')
          // resize the remaining videos height and width
          changeCssVideos(main, elms)
        }
      })

      socket.on('user-joined', (id, clients) => {
        console.log('id: ' + id)
        console.log('clients ' + clients)

        clients.forEach((socketListId) => {
          console.log('socketListId ' + socketListId)

          connections[socketListId] = new RTCPeerConnection(
            peerConnectionConfig
          )
          // Wait for their ice candidate
          connections[socketListId].onicecandidate = (event) => {
            if (event.candidate != null) {
              socket.emit(
                'signal',
                socketListId,
                JSON.stringify({ ice: event.candidate })
              )
            }
          }

          // Wait for their video stream
          connections[socketListId].onaddstream = (event) => {
            // TODO mute button, full screen button
            var searchVidep = document.querySelector(
              `[data-socket="${socketListId}"]`
            )
            if (searchVidep !== null) {
              console.log('searchVidep ' + searchVidep)
              // if i don't do this check it make an empyt square
              searchVidep.srcObject = event.stream
            } else {
              elms = clients.length
              let main = document.getElementById('main')
              let cssMesure = changeCssVideos(main, elms)

              let video = document.createElement('video')

              let css = {
                minWidth: cssMesure.minWidth,
                minHeight: cssMesure.minHeight,
                maxHeight: '100%',
                objectFit: 'fill',
              }
              for (let i in css) video.style[i] = css[i]

              video.style.setProperty('width', cssMesure.width)
              video.style.setProperty('height', cssMesure.height)
              video.setAttribute('data-socket', socketListId)
              video.srcObject = event.stream
              video.autoplay = true
              video.playsinline = true

              main.appendChild(video)

              console.log(video.srcObject)
            }
          }

          // Add the local video stream
          if (window.localStream !== undefined && window.localStream !== null) {
            console.log(window.localStream)
            connections[socketListId].addStream(window.localStream)
          } else {
            let blackSilence = (...args) =>
              new MediaStream([black(...args), silence()])
            window.localStream = blackSilence()
            connections[socketListId].addStream(window.localStream)
          }
        })

        if (id === socketId) {
          for (let id2 in connections) {
            if (id2 === socketId) continue

            try {
              connections[id2].addStream(window.localStream)
            } catch (e) {}

            connections[id2].createOffer().then((description) => {
              connections[id2]
                .setLocalDescription(description)
                .then(() => {
                  socket.emit(
                    'signal',
                    id2,
                    JSON.stringify({ sdp: connections[id2].localDescription })
                  )
                })
                .catch((e) => console.log(e))
            })
          }
        }
      })
    })
  }

  const handleVideo = () => {
    console.log('handleVideo')
    setvideo((prevVideo) => !prevVideo)
    // getUserMedia()
    window.localStream = stream
    localVideoref.current.srcObject.getVideoTracks()[0].enabled =
      !localVideoref.current.srcObject.getVideoTracks()[0].enabled
  }

  const handleAudio = () => {
    console.log('handleAudio')
    setaudio(!audio)
    // getUserMedia()
    localVideoref.current.srcObject.getAudioTracks()[0].enabled =
      !localVideoref.current.srcObject.getAudioTracks()[0].enabled
  }

  const handleScreen = () => {
    setscreen(!screen)
    getDislayMedia()
  }

  const handleEndCall = () => {
    try {
      let tracks = localVideoref.current.srcObject.getTracks()
      tracks.forEach((track) => track.stop())
    } catch (e) {}
    window.location.href = '/'
  }

  const handleUsername = (e) => setusername(e.target.value)

  const connect = () => {
    setaskForUsername(false)
    getMedia()
  }

  console.log('THIS: ' + window.location.href.includes('ghost'))
  console.log('connections: ' + JSON.stringify(connections))

  const record = () => {
    API.post('/record', {
      url: window.location.href,
    })
  }

  const stopRecording = () => {
    API.post('/record/stop')
  }

  return (
    <div>
      {askForUsername === true ? (
        <div>
          <div className='ask-for-username-container'>
            <p className='username'>Set your username</p>
            <Input
              placeholder='Username'
              value={username}
              onChange={(e) => handleUsername(e)}
            />
            <Button
              variant='contained'
              color='primary'
              onClick={connect}
              style={{ margin: '20px' }}
            >
              Connect
            </Button>
          </div>

          <div
            style={{
              justifyContent: 'center',
              textAlign: 'center',
              paddingTop: '40px',
            }}
          >
            {/* VIDEO PREVIEW BEFORE ENTERING ROOM */}
            <video
              id='my-video'
              ref={localVideoref}
              autoPlay
              muted
              style={{
                borderStyle: 'solid',
                borderColor: '#bdbdbd',
                objectFit: 'fill',
                width: '60%',
                height: '30%',
              }}
            ></video>
          </div>
        </div>
      ) : (
        <div>
          {/* VIDEO CONTROLS */}
          <div className='btn-down'>
            <IconButton style={{ color: '#424242' }} onClick={handleVideo}>
              {video == true ? <VideocamIcon /> : <VideocamOffIcon />}
            </IconButton>

            <IconButton style={{ color: '#f44336' }} onClick={handleEndCall}>
              <CallEndIcon />
            </IconButton>

            <IconButton style={{ color: '#424242' }} onClick={handleAudio}>
              {audio === true ? <MicIcon /> : <MicOffIcon />}
            </IconButton>

            {screenAvailable === true ? (
              <IconButton style={{ color: '#424242' }} onClick={handleScreen}>
                {screen === true ? (
                  <ScreenShareIcon />
                ) : (
                  <StopScreenShareIcon />
                )}
              </IconButton>
            ) : null}
            <button onClick={record}>Record</button>
            <button onClick={stopRecording}>Stop Recording</button>
          </div>

          <div className='container'>
            <div style={{ paddingTop: '20px', paddingBottom: '20px' }}>
              <Input value={window.location.href} disable='true'></Input>
            </div>
            {/* THE ACTUAL VIDEOS IN THE ROOM */}
            <Row
              id='main'
              className='flex-container'
              style={{ margin: 0, padding: 0 }}
            >
              <video
                id='my-video'
                ref={localVideoref}
                autoPlay
                muted
                style={{
                  borderStyle: 'solid',
                  borderColor: '#bdbdbd',
                  margin: '0',
                  padding: '0',
                  objectFit: 'fill',
                  width: '100%',
                  height: '100%',
                }}
              ></video>
            </Row>
          </div>
        </div>
      )}
    </div>
  )
}

export default Video
