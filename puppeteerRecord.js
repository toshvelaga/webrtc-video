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
  const browser = await puppeteer.launch({
    headless: false,
    executablePath:
      '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  })
  const page = await browser.newPage()
  const recorder = new PuppeteerScreenRecorder(page, Config)
  await recorder.start('./report/video/tosh.mp4') // supports extension - mp4, avi, webm and mov
  await page.goto('http://localhost:8000/tosh')
  await recorder.stop()
  await browser.close()
})()
