const puppeteer = require('puppeteer')
const { PuppeteerScreenRecorder } = require('puppeteer-screen-recorder')

;(async () => {
  const browser = await puppeteer.launch()
  const page = await browser.newPage()
  const recorder = new PuppeteerScreenRecorder(page)
  await recorder.start('./report/video/spotify.mp4') // supports extension - mp4, avi, webm and mov
  await page.goto('https://open.spotify.com/episode/033bxIFePCK1JIy3wiBxBL')
  await recorder.stop()
  await browser.close()
})()
