const puppeteer = require('puppeteer')

;(async () => {
  const browser = await puppeteer.launch({ headless: true })
  const page = await browser.newPage()
  await page.goto('http://localhost:8000/tosh')
  await page.screenshot({ path: 'example.png' })

  await browser.close()
})()
