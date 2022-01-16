const puppeteer = require('puppeteer')
const { PuppeteerScreenRecorder } = require('puppeteer-screen-recorder')

const config = {
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
  await page.goto('https://video-meeting-socket.herokuapp.com/tosh')
  await page.waitForSelector('button')
  await page.click('button')
  const recorder = new PuppeteerScreenRecorder(page)

  await recorder.start('./reports/videos/recording.mp4') // supports extension - mp4, avi, webm and mov
  await page.waitForTimeout(4000)

  await recorder.stop()
  await browser.close()
})()
