import puppeteer from 'puppeteer'
import pageUtil from '../puppeteer/page-util'
import withManagedBrowser from '../puppeteer/managed-browser'
import moment from 'moment'
import async from 'async'

export type HutId = number
export type AODate = string // format DD.MM.YYYY
export interface Hut {
  id: HutId
  name: string
  altitude: string
  email: string
}
export type CountryCode = string
export interface GetHutsByCountryCodeResult {
  countryCode: CountryCode
  huts: Hut[]
}
export interface GetHutInfoResult {
  id: HutId
  info: string[]
}
export type GetCountryCodesResult = CountryCode[]
export interface GetReservationsResult {
  hutId: HutId
  reservations: {
    date: AODate
    data: SelectDateResponseItem[]
  }[]
}

export interface SelectDateResponse {
  '0': SelectDateResponseItem[]
  '1': SelectDateResponseItem[]
  '2': SelectDateResponseItem[]
  '3': SelectDateResponseItem[]
  '4': SelectDateResponseItem[]
  '5': SelectDateResponseItem[]
  '6': SelectDateResponseItem[]
  '7': SelectDateResponseItem[]
  '8': SelectDateResponseItem[]
  '9': SelectDateResponseItem[]
  '10': SelectDateResponseItem[]
  '11': SelectDateResponseItem[]
  '12': SelectDateResponseItem[]
  '13': SelectDateResponseItem[]
}
export interface SelectDateResponseItem {
  bookingEnabled: boolean
  closed: boolean
  freeRoom: number
  totalRoom: number
  reservationDate: string
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

  const getHutsByCountryCode = async ({ countryCode , options = {} }: { countryCode: string, options?: { browser?: puppeteer.Browser, page?: puppeteer.Page }}): Promise<GetHutsByCountryCodeResult> => {
    const url = `https://www.alpsonline.org/reservation/detail/fetchHuts?countryCode=${countryCode}`
    return withManagedBrowser(options, async ({ page }: { page: puppeteer.Page}) => {
      const response = await page.goto(url)
      const huts = await response.json()
      return { countryCode, huts }
    })
  }
  const getHutInfo = async ({ hutId , options = {} }: { hutId: number, options?: { browser?: puppeteer.Browser, page?: puppeteer.Page }}): Promise<GetHutInfoResult> => {
    const url = `https://www.alpsonline.org/reservation/calendar?hut_id=${hutId}`
    return withManagedBrowser(options, async ({ page }: { page: puppeteer.Page}) => {
      await page.goto(url)
      const info = await pageUtil(page).$$text('.info span')
      return { id: hutId, info }
    })
  }
  const getCountryCodes = async (): Promise<GetCountryCodesResult> => {
    return Promise.resolve(['DE', 'IT', 'AT', 'CH', 'SI'])
  }
  const AO_DAYS_PER_REQUEST = 14
  const AO_DATE_FORMAT = 'DD.MM.YYYY'
  const getReservations = async({
    hutId,
    from,
    to,
    options = {}
  }: { 
    hutId: number,
    from: moment.Moment, 
    to: moment.Moment, 
    options?: { 
      browser?: puppeteer.Browser, 
      page?: puppeteer.Page 
    }
  }): Promise<GetReservationsResult> => {
    const diffInDays = to.diff(from, 'days')
    const numRequests = Math.ceil(diffInDays / AO_DAYS_PER_REQUEST)
    const dates = Array.from(Array(numRequests).keys())
      .map(idx => from.clone()
        .add(idx * AO_DAYS_PER_REQUEST, 'days')
        .format(AO_DATE_FORMAT)
      )
    const url = `https://www.alpsonline.org/reservation/calendar?hut_id=${hutId}`
    return withManagedBrowser(options, async ({ page }: { page: puppeteer.Page}) => {
      await page.goto(url)

      const obj: GetReservationsResult = {
        hutId,
        reservations: []
      }
    
      await async.eachSeries(dates, async (date) => {
        const url = `https://www.alpsonline.org/reservation/selectDate?date=${date}`
        const response = await page.goto(url)
        const json: SelectDateResponse = await response.json()
        Object.entries(json).forEach(([key, val]: [string, SelectDateResponseItem[]]) => {
          obj.reservations.push({
            date: val[0].reservationDate,
            data: val
          })
        })
      })

      return obj
    })
  }

  return {
    getCountryCodes,
    getHutsByCountryCode,
    getHutInfo,
    getReservations
  }
}

export default client