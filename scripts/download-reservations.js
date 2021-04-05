'use strict'

const async = require('async')
const moment = require('moment')
const puppeteer = require('puppeteer')

const hutRepo = require('./../lib/repo/hut-repo')
const data = require('../lib/data')
const { execute } = require('../lib/util/script-util')

const AO_DATE_FORMAT = 'DD.MM.YYYY'
const AO_DAYS_PER_REQUEST = 14

execute(async () => {
  const startDate = moment('01.01.2021', AO_DATE_FORMAT)
  const endDate = moment('31.12.2021', AO_DATE_FORMAT)
  const diffInDays = endDate.diff(startDate, 'days')
  // console.log('diffInDays', diffInDays)
  const numRequests = Math.ceil(diffInDays / AO_DAYS_PER_REQUEST)
  // console.log('numRequests', numRequests)
  const dates = Array.from(Array(numRequests).keys())
    .map(idx => {
      return moment(startDate).add(idx * AO_DAYS_PER_REQUEST, 'days').format(AO_DATE_FORMAT)
    })
  // console.log(dates)

  const hutIds = await (await hutRepo.getAll()).transform(hutRepo.tx.mapToIds())

  await async.eachOfLimit(hutIds, 5, async (hutId, idx) => {
    console.log(`Downloading ${idx+1}/${hutIds.length} - ${hutId}`)

    const browser = await puppeteer.launch({ headless: true })
    const page = await browser.newPage()
    
    const url = `https://www.alpsonline.org/reservation/calendar?hut_id=${hutId}`
    await page.goto(url)
    
    const obj = {
      hutId,
      reservations : {}
    }
  
    await async.eachSeries(dates, async (date) => {
      const url = `https://www.alpsonline.org/reservation/selectDate?date=${date}`
      const response = await page.goto(url)
      const json = await response.json()
      Object.entries(json).forEach(([key, val]) => {
        obj.reservations[val[0].reservationDate] = {
          lastUpdated: moment(),
          data: val
        }
      })
    })
  
    await data.download.reservationsForHutJSON.write(hutId, obj)
    await page.close()
    await browser.close()
  })

})