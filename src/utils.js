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
