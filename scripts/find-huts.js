'use strict'

const hutRepo = require('../lib/repo/hut-repo')
const hutPrinter = require('./../lib/cli/hut-printer')
const { execute } = require('../lib/util/script-util')

execute(async () => {
  const huts = await hutRepo.getAll()
  const filteredHuts = await huts.transform(
    hutRepo.tx.dropNullCoordinates(),
    // hutRepo.tx.filterByName('lindauer'),
    // hutRepo.tx.or(
    //   hutRepo.tx.filterByCountryCode('DE'),
    //   // hutRepo.tx.filterByCountryCode('CH')
    // ),
    hutRepo.tx.joinReservations(),
    hutRepo.tx.filterForOpenAt('13.02.2021'),
    hutRepo.tx.sortByName()
  )

  // console.log(filteredHuts[0])
  
  hutPrinter.list(filteredHuts)
})