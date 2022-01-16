const puppeteer = require('puppeteer')

;(async () => {
  const browser = await puppeteer.launch({ headless: true })

  const page = await browser.newPage()
  await page.goto('https://video-meeting-socket.herokuapp.com/tosh')
  await page.waitForSelector('button')
  await page.click('button')
  await page.waitForTimeout(2000)
  await page.screenshot({ path: './reports/images/example6.png' })

  await browser.close()
})()
