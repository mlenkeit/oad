'use strict'
/*
    "id": 297,
    "name": "Lindauer Hütte",

    "id": 91,
    "name": "Tilisunahütte",

    "id": 46,
    "name": "Carschinahütte SAC",
*/

const reservationRepo = require('./lib/repo/reservation-repo')
const hutRepo = require('./lib/repo/hut-repo')
const hutPrinter = require('./lib/cli/hut-printer')
const scriptUtil = require('./lib/util/script-util')

scriptUtil.execute(async () => {
  const hutSequence = [297, 91, 46]
  const groupSize = 2

  const huts = await hutRepo.getByIds(hutSequence)
  console.log('Route')
  hutPrinter.list(huts)

  const reservations = await (await reservationRepo
    .getByDateRange('09.06.2021', '30.06.2021'))
    .transform(
      reservationRepo.tx.joinHuts(),
      reservationRepo.tx.transformHuts(
        hutRepo.tx.filterByHutIds(hutSequence),
        reservationRepo.tx.rejectClosed(),
        reservationRepo.tx.filterByMinFreeRoom(groupSize),
    //     // hutRepo.tx.filterByCountryCode('DE'),
    //     hutRepo.tx.sortByName()
      )
    )

  const startDates = reservations
    .filter((reservation, idx, reservations) => {
      const bookable = hutSequence.every((hutId, hutIdx) => {
        const reservationIdx = idx + hutIdx
        const reservation = reservations[reservationIdx]
        return reservation 
          && reservation.huts 
          && reservation.huts.find(hutAtDate => hutAtDate.id === hutId)
      })
      // console.log(reservation.date, bookable)
      return bookable
    })
    .map(reservation => reservation.date)

  console.log('Start Dates')
  startDates.forEach(date => console.log(`- ${date}`))
  
})