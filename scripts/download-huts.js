'use strict'

const async = require('async')
const moment = require('moment')
const puppeteer = require('puppeteer')

const countryCodeRepo = require('../lib/repo/country-code-repo')
const data = require('./../lib/data')
const { execute } = require('../lib/util/script-util')

execute(async () => {
  const countryCodes = await countryCodeRepo.getAll()

  const browser = await puppeteer.launch({ headless: true })

  await async.eachOfLimit(countryCodes, 2, async (countryCode, idx) => {
    console.log(`Downloading ${idx+1}/${countryCodes.length} - ${countryCode}`)

    const page = await browser.newPage()
    const url = 'https://www.alpsonline.org/reservation/detail/fetchHuts?countryCode=' + countryCode
    const response = await page.goto(url)
    
    const json = await response.json()
    const obj = {
      lastUpdated: moment(),
      countryCode,
      data: json
    }
    await data.download.hutsForCountryCodeJSON.write(countryCode, obj)

    await page.close()
  })

  await browser.close()
})