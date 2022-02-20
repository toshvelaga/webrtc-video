// server utility functions

const getPathFromUrl = (url) => {
  return url.split('?')[0]
}

module.exports = getPathFromUrl
