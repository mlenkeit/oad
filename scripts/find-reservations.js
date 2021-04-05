'use strict'

const reservationRepo = require('../lib/repo/reservation-repo')
const hutRepo = require('./../lib/repo/hut-repo')
const hutPrinter = require('./../lib/cli/hut-printer')
const scriptUtil = require('../lib/util/script-util')

scriptUtil.execute(async () => {
  const reservations = await (await reservationRepo
    .getByDates(['02.02.2021']))
    .transform(
      reservationRepo.tx.joinHuts(),
      reservationRepo.tx.transformHuts(
        reservationRepo.tx.rejectClosed(),
        reservationRepo.tx.filterByMinFreeRoom(20),
        // hutRepo.tx.filterByCountryCode('DE'),
        hutRepo.tx.sortByName()
      )
    )
  
  reservations.forEach(reservation => {
    console.log(reservation.date)
    hutPrinter.list(reservation.huts)
    console.log('')
  })
})