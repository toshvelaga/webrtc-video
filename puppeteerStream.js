const { launch, getStream } = require('puppeteer-stream')
const fs = require('fs')
const express = require('express')
const router = express.Router()

// node arguments are present from the third position going forward.
const args = process.argv.slice(2)
const file = fs.createWriteStream(`./reports/videos/${args[0]}.mp4`)

require('dotenv').config()

// OLD DOCS = https://legacydocs.hubspot.com/docs/methods/contacts/create_contact

// NEW DOCS = https://developers.hubspot.com/docs/api/crm/contacts

const puppeteerStream = async (url) => {
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
  const { url } = req.body
  puppeteerStream(url)
  return res.status(201).send('recording')
})

module.exports = router
