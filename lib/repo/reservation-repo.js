'use strict'

const async = require('async')
const moment = require('moment')

const hutRepo = require('./hut-repo')
const data = require('../data')
const TransformableArray = require('../util/transformable-array')

const AO_DATE_FORMAT = 'DD.MM.YYYY'

const getAll = async () => {
  const reservationsByDate = await data.aggregate.reservationsJSON()
  const reservations = Object.entries(reservationsByDate)
    .map(([date, obj]) => obj)
  return TransformableArray.from(reservations)
}

const getByDates = async dates => {
  const all = await getAll()
  const reservations = all.filter(it => dates.includes(it.date))
  return TransformableArray.from(reservations)
}

const getByDateRange = async (startDate, endDate) => {
  const start = moment(startDate, AO_DATE_FORMAT)
  const end = moment(endDate, AO_DATE_FORMAT)

  const all = await getAll()
  const reservations = all.filter(it => {
    const date = moment(it.moment)
    return date.isSameOrAfter(start) && date.isSameOrBefore(end)
  })
  return TransformableArray.from(reservations)
}

const getByDate = async date => {
  const all = await getAll()
  const reservation = all.find(it => it.date === date)
  return reservation
}

module.exports = {
  getAll,
  getByDate,
  getByDateRange,
  getByDates,
  tx: {
    rejectClosed: () => arr => arr.filter(hutAtDate => hutAtDate.closed !== true),
    filterByMinFreeRoom: minFreeFrom => arr => arr.filter(hutAtDate => hutAtDate.freeRoom >= minFreeFrom),
    joinHuts: () => arr => async.map(arr, async reservation => {
      reservation.huts = await async.map(reservation.huts, async hutAtDate => {
        const hut = await hutRepo.getById(hutAtDate.hutId)
        return { ...hut, ...hutAtDate }
      })
      return reservation
    }),
    transformHuts: function() {
      return async arr => async.map(arr, async reservation => {
        reservation.huts = await TransformableArray
          .from(reservation.huts)
          .transform(...Array.from(arguments))
        return reservation
      })
    }
  }
}