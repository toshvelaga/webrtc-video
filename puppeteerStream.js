const { launch, getStream } = require('puppeteer-stream')
const fs = require('fs')

const file = fs.createWriteStream('./report/video/tosh2.mp4')

async function test() {
  const browser = await launch()

  const page = await browser.newPage()
  await page.goto('https://video-meeting-socket.herokuapp.com/tosh')
  const stream = await getStream(page, { audio: true, video: true })
  console.log('recording')

  stream.pipe(file)
  setTimeout(async () => {
    await stream.destroy()
    file.close()
    console.log('finished')
  }, 1000 * 10)
}

test()
