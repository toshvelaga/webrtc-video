const puppeteer = require('puppeteer')
const { PuppeteerScreenRecorder } = require('puppeteer-screen-recorder')

// node arguments are present from the third position going forward.
const args = process.argv.slice(2)

;(async () => {
  const browser = await puppeteer.launch()

  const page = await browser.newPage()
  await page.goto('http://localhost:8000/demo')
  await page.waitForSelector('button')
  await page.click('button')

  const recorder = new PuppeteerScreenRecorder(page)
  await recorder.start(`./reports/videos/${args[0]}.mp4`) // supports extension - mp4, avi, webm and mov

  await page.waitForTimeout(8000)

  await recorder.stop()
  await browser.close()
})()
