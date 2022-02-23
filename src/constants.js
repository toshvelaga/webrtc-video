export const server_url =
  process.env.NODE_ENV === 'production'
    ? 'https://video-meeting-socket.herokuapp.com'
    : 'http://localhost:4001'
