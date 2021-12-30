export const isChrome = () => {
  let userAgent = (navigator && (navigator.userAgent || '')).toLowerCase()
  let vendor = (navigator && (navigator.vendor || '')).toLowerCase()
  let matchChrome = /google inc/.test(vendor)
    ? userAgent.match(/(?:chrome|crios)\/(\d+)/)
    : null
  // let matchFirefox = userAgent.match(/(?:firefox|fxios)\/(\d+)/)
  // return matchChrome !== null || matchFirefox !== null
  return matchChrome !== null
}

export const silence = () => {
  let ctx = new AudioContext()
  let oscillator = ctx.createOscillator()
  let dst = oscillator.connect(ctx.createMediaStreamDestination())
  oscillator.start()
  ctx.resume()
  return Object.assign(dst.stream.getAudioTracks()[0], { enabled: false })
}

export const black = ({ width = 640, height = 480 } = {}) => {
  let canvas = Object.assign(document.createElement('canvas'), {
    width,
    height,
  })
  canvas.getContext('2d').fillRect(0, 0, width, height)
  let stream = canvas.captureStream()
  return Object.assign(stream.getVideoTracks()[0], { enabled: false })
}
