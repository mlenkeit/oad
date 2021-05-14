import * as puppeteer from 'puppeteer'
import pageUtil from './../puppeteer/page-util'
import withManagedBrowser from './../puppeteer/managed-browser'

export interface Hut {
  id: number
  name: string
  altitude: string
  email: string
}
export interface HutsByCountryCodeResult {
  countryCode: string
  huts: Hut[]
}
export interface HutInfoResult {
  id: number
  info: string[]
}

export const client = () => {
  // const withManagedBrowser = async (options: { browser?: puppeteer.Browser, page?: puppeteer.Page }, callback: any) => {
  //   const browser = options.browser ?? await puppeteer.launch({ headless: false })
  //   const page = options.page ?? await browser.newPage()
  //   const result = await callback({ browser, page })
  //   if (!options.page) await page.close()
  //   if (!options.browser) await browser.close()
  //   return result
  // }

  const getHutsByCountryCode = async ({ countryCode , options = {} }: { countryCode: string, options?: { browser?: puppeteer.Browser, page?: puppeteer.Page }}): Promise<HutsByCountryCodeResult> => {
    const url = `https://www.alpsonline.org/reservation/detail/fetchHuts?countryCode=${countryCode}`
    return withManagedBrowser(options, async ({ page }: { page: puppeteer.Page}) => {
      const response = await page.goto(url)
      const huts = await response.json()
      return { countryCode, huts }
    })
  }
  const getHutInfo = async ({ hutId , options = {} }: { hutId: number, options?: { browser?: puppeteer.Browser, page?: puppeteer.Page }}): Promise<HutInfoResult> => {
    const url = `https://www.alpsonline.org/reservation/calendar?hut_id=${hutId}`
    return withManagedBrowser(options, async ({ page }: { page: puppeteer.Page}) => {
      await page.goto(url)
      const info = await pageUtil(page).$$text('.info span')
      return { id: hutId, info }
    })
  }

  return {
    getHutsByCountryCode,
    getHutInfo
  }
}

export default client