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
  const browser = await puppeteer.launch()
  const page = await browser.newPage()
  const recorder = new PuppeteerScreenRecorder(page, Config)
  await recorder.start('./report/video/spotify.mp4') // supports extension - mp4, avi, webm and mov
  await page.goto('https://open.spotify.com/episode/033bxIFePCK1JIy3wiBxBL')
  await recorder.stop()
  await browser.close()
})()
