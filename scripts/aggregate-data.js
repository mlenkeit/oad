'use strict'

const fse = require('fs-extra')
const klaw = require('klaw')
const moment = require('moment')
const through2 = require('through2')

const data = require('./../lib/data')

const AO_DATE_FORMAT = 'DD.MM.YYYY'

const allHuts = new Map()
const allDates = new Map()
const allReservationsByHut = new Map()

const processCountryCode = obj => {
  obj.data.forEach(item => {
    const hut = {
      id: item.id,
      name: item.name,
      countryCode: obj.countryCode,
      // data: item
    }
    allHuts.set(item.id, hut)
  })

}

const processHut = obj => {
  const allReservations = allReservationsByHut.get(obj.hutId) || []
  
  Object.entries(obj.reservations).forEach(([date, item]) => {
    if (!allDates.has(date)) {
      const dateObj = {
        date,
        moment: moment(date, AO_DATE_FORMAT),
        huts: []
      }
      allDates.set(date, dateObj)
    }
    const dateObj = allDates.get(date)
    dateObj.huts.push({
      hutId: obj.hutId,
      // bookingEnabled: item.data.some(it => it.bookingEnabled === true),
      bookingEnabled: item.data[0].bookingEnabled,
      closed: item.data[0].closed,
      freeRoom: item.data
        .filter(it => it.closed === false)
        .reduce((total, it) => total + it.freeRoom, 0)
      // details: item.data
    })

    allReservations.push({
      date,
      moment: moment(date, AO_DATE_FORMAT),
      bookingEnabled: item.data[0].bookingEnabled,
      closed: item.data[0].closed,
      freeRoom: item.data
        .filter(it => it.closed === false)
        .reduce((total, it) => total + it.freeRoom, 0)
    })
  })


  allReservationsByHut.set(obj.hutId, allReservations)
}

klaw('./data/download')
  .pipe(through2.obj(function (item, enc, next) {
    if (!item.stats.isDirectory()) this.push(item)
    next()
  }))
  .pipe(through2.obj(function(item, enc, next) {
    fse.readJSON(item.path)
      .then(json => {
        item.json = json
        this.push(item)
        next()
      })
  }))
  .pipe(through2.obj(function(item, enc, next) {
    if (!!item.json.countryCode) {
      processCountryCode(item.json)
      this.push(item)
    } else if (!!item.json.hutId) {
      processHut(item.json)
      this.push(item)
    }
    next()
  }))
  .on('data', item => {
    console.log(item.path)
  })
  .on('end', async () => {
    const allData = {
      huts: Object.fromEntries(allHuts),
      dates: Object.fromEntries(allDates)
    }
    // await data.aggregate.hutsJSON.write(Object.fromEntries(allHuts))
    // await data.aggregate.reservationsJSON.write(Object.fromEntries(allDates))
    // await data.aggregate.allDataJSON.write(allData)
    await data.aggregate.reservationsByHutJSON.write(Object.fromEntries(allReservationsByHut))
    console.log('Done.')
  })