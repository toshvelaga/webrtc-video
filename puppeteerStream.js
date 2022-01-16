const { launch, getStream } = require('puppeteer-stream')
const fs = require('fs')

const file = fs.createWriteStream('./report/video/tosh.mp4')

async function test() {
  const browser = await launch({
    defaultViewport: {
      width: 1920,
      height: 1080,
    },
  })

  const page = await browser.newPage()
  await page.goto('http://localhost:8000/tosh')
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
