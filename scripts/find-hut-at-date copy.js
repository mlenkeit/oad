'use strict'

const fse = require('fs-extra')

const huts = require('../lib/repo/hut-repo')
const mapGenerator = require('../lib/maps/map-generator')

const AO_DATE_FORMAT = 'DD.MM.YYYY'

const date = '02.06.2021'

const main = async () => {
  const allData = await fse.readJSON('data/aggregate/all-data.json')
  const dateObj = allData.dates[date]
  const openHuts = dateObj.huts
    .filter(hut => hut.closed === false)
  const hutIds = openHuts.map(it => '' + it.hutId)
  const hutObjs = await huts.getByIds(hutIds)
    // .map(hut => {
    //   // console.log(hut.hutId, hut.freeRoom)
    //   const hutObj = await huts.getById('' + hut.hutId)
    //   // return { ...allData.huts[''+hut.hutId], freeRoom: hut.freeRoom }
    //   return { ...hutObj, freeRoom: hut.freeRoom }
    // })
  const home = {
    latitude: 49.47982299640468, longitude: 8.469778153155229
  }
  const hutsToDisplay = hutObjs
    .filter(huts.tx.filter.byMaxElavation(2000))
    .map(huts.tx.map.withDistanceFrom(home))
    .sort(huts.tx.sort.byDistance())

  console.log('Number of Huts', hutsToDisplay.length)
  hutsToDisplay
    .forEach(hut => {
      const geolib = require('geolib')
      let distance
      if (hut.coordinates) {
        distance = geolib.getDistance(home, hut.coordinates) / 1000
      }
      console.log(`${hut.countryCode} ${hut.id} - ${hut.name} (${hut.freeRoom}) - ${distance} km | ${hut.elavation}`)
    })
  console.log('Number of Huts', hutsToDisplay.length)

  await mapGenerator.writeDefaultMapWithMarkers(hutsToDisplay, date)
}

main()
  .then(() => console.log('Done.'))
  .catch(err => console.error(err))