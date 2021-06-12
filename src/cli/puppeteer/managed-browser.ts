import puppeteer from 'puppeteer'

export default async<T> (options: { browser?: puppeteer.Browser, page?: puppeteer.Page }, callback: (context: { browser: puppeteer.Browser, page: puppeteer.Page}) => Promise<T>) => {
  const browser = options.browser ?? await puppeteer.launch({ headless: true })
  const page = options.page ?? await browser.newPage()
  const result = await callback({ browser, page })
  if (!options.page) await page.close()
  if (!options.browser) await browser.close()
  return result
}