const { launch, getStream } = require('puppeteer-stream')
const fs = require('fs')

// node arguments are present from the third position going forward.
const args = process.argv.slice(2)
const file = fs.createWriteStream(`./reports/videos/${args[0]}.mp4`)

async function puppeteerStream() {
  const browser = await launch()

  const page = await browser.newPage()
  await page.goto('https://video-meeting-socket.herokuapp.com/tosh')
  await page.waitForSelector('button')
  await page.click('button')

  const stream = await getStream(page, { audio: true, video: true })
  stream.pipe(file)

  await page.waitForTimeout(8000)
  await stream.destroy()
  await browser.close()
  file.close()
}

puppeteerStream()
