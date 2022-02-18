import axios from 'axios'

const baseURL =
  process.env.NODE_ENV === 'production'
    ? 'https://video-meeting-socket.herokuapp.com/api'
    : 'http://localhost:4001/api'

const API = axios.create({
  baseURL,
})

export default API
