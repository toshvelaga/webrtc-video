const { launch, getStream } = require('puppeteer-stream')
const fs = require('fs')
const express = require('express')
const router = express.Router()

require('dotenv').config()

const puppeteerStream = async (url, fileName) => {
  const file = fs.createWriteStream(`./reports/videos/${fileName}.mp4`)

  const browser = await launch({
    executablePath:
      '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  })

  const page = await browser.newPage()
  await page.goto(url)
  await page.waitForSelector('button')
  await page.click('button')

  // records audio and video
  const stream = await getStream(page, { audio: true, video: true })
  stream.pipe(file)

  await page.waitForTimeout(8000)
  await stream.destroy()
  await browser.close()
  file.close()
}

router.post('/api/record', async (req, res) => {
  // const { url, fileName } = req.body
  // puppeteerStream(url, fileName)
  // return res.status(201).send('recording')
  const browser = await launch({
    executablePath:
      '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    defaultViewport: {
      width: 1920,
      height: 1080,
    },
  })

  const page = await browser.newPage()
  await page.goto('https://www.youtube.com/watch?v=dQw4w9WgXcQ')
  const stream = await getStream(page, { audio: true, video: true })
  console.log('recording')

  const head = {
    // 'Content-Length': fileSize,
    'Content-Type': 'video/mp4',
  }
  res.writeHead(200, head)
  stream.pipe(res)

  await page.waitForTimeout(8000)
  await stream.destroy()
  await browser.close()
  console.log(res)
})

module.exports = router
