'use strict'

const async = require('async')
const puppeteer = require('puppeteer')

const data = require('./../lib/data')
const hutRepo = require('./../lib/repo/hut-repo')
const pageUtil = require('./../lib/puppeteer/page-util')
const { execute } = require('../lib/util/script-util')

execute(async () => {
  const hutIds = await (await hutRepo.getAll()).transform(hutRepo.tx.mapToIds())

  const hutInfos = await async.mapLimit(hutIds, 5, async hutId => {
    const idx = hutIds.indexOf(hutId)
    console.log(`Downloading ${idx+1}/${hutIds.length} - ${hutId}`)

    const browser = await puppeteer.launch({ headless: true })
    const page = await browser.newPage()

    const url = `https://www.alpsonline.org/reservation/calendar?hut_id=${hutId}`
    await page.goto(url)

    const hutInfo = {
      hutId,
      info: await pageUtil(page).$$text('.info span')
    }
    
    await page.close()
    await browser.close()

    return hutInfo
  })

  await data.download.hutInfosJSON.write(hutInfos)
})