const puppeteer = require('puppeteer')
const { PuppeteerScreenRecorder } = require('puppeteer-screen-recorder')

const Config = {
  followNewTab: true,
  fps: 25,
  videoFrame: {
    width: 1024,
    height: 768,
  },
  aspectRatio: '4:3',
  recordDurationLength: 10,
}

;(async () => {
  const browser = await puppeteer.launch({ headless: false })
  const page = await browser.newPage()
  const recorder = new PuppeteerScreenRecorder(page, Config)
  await recorder.start('./report/video/video.mp4') // supports extension - mp4, avi, webm and mov
  await page.goto('https://video-meeting-socket.herokuapp.com/tosh')
  await recorder.stop()
  await browser.close()
})()
