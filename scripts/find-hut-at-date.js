'use strict'

const fse = require('fs-extra')

const hutRepo = require('../lib/repo/hut-repo')
const hutPrinter = require('./../lib/cli/hut-printer')
const mapGenerator = require('../lib/maps/map-generator')

const AO_DATE_FORMAT = 'DD.MM.YYYY'

const date = '01.07.2021'

const main = async () => {
  const allData = await fse.readJSON('data/aggregate/all-data.json')
  const dateObj = allData.dates[date]
  const openHuts = dateObj.huts
    .filter(hut => hut.closed === false)
  const hutIds = openHuts.map(it => '' + it.hutId)
  const hutObjs = await hutRepo.getByIds(hutIds)
    // .map(hut => {
    //   // console.log(hut.hutId, hut.freeRoom)
    //   const hutObj = await hutRepo.getById('' + hut.hutId)
    //   // return { ...allData.huts[''+hut.hutId], freeRoom: hut.freeRoom }
    //   return { ...hutObj, freeRoom: hut.freeRoom }
    // })
  const home = {
    // latitude: 49.47982299640468, longitude: 8.469778153155229
    latitude: 46.50914690121366, longitude: 11.757522817752104
  }
  const hutsToDisplay = await hutObjs.transform(
    hutRepo.tx.rejectCountryCode('SI'),
    // hutRepo.tx.filterByMaxElavation(2000),
    hutRepo.tx.appendDistanceFrom(home),
    hutRepo.tx.sortByDistance()
  )

  hutPrinter.list(hutsToDisplay, {
    with: hut => hutPrinter.formatDistance(hut.distance)
  })

  await mapGenerator.writeDefaultMapWithMarkers(hutsToDisplay, date)
}

main()
  .then(() => console.log('Done.'))
  .catch(err => console.error(err))