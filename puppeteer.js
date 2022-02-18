const puppeteer = require('puppeteer')

// node arguments are present from the third position going forward.
const args = process.argv.slice(2)

;(async () => {
  const browser = await puppeteer.launch({ headless: true })

  const page = await browser.newPage()
  // create a room called room
  await page.goto('http://localhost:8000/demo')
  await page.waitForSelector('button')
  await page.click('button')
  await page.waitForTimeout(2000)
  await page.screenshot({ path: `./reports/images/${args[0]}.png` })

  await browser.close()
})()
