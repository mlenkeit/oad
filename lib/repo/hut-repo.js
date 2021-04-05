'use strict'

const geolib = require('geolib')
const moment = require('moment')

const data = require('../data')
const hutMetadataRepo = require('./hut-metadata-repo')
const reservationRepo = require('./reservation-repo')
const TransformableArray = require('../util/transformable-array')

const AO_DATE_FORMAT = 'DD.MM.YYYY'

const getAll = async () => {
  const huts = await data.aggregate.hutsJSON()
  const allMetadata = await hutMetadataRepo.getAll()

  const allHuts = Object.entries(huts)
    .map(([hutId, hut]) => {
      const metadata = allMetadata.find(it => it.hutId === hut.id) || {}
      return {
        id: hut.id,
        name: hut.name,
        countryCode: hut.countryCode,
        elavation: metadata.elavation,
        coordinates: metadata.coordinates
      }
    })
  return TransformableArray.from(allHuts)
}

const getById = async hutId => {
  const hutIdStr = `${hutId}`
  const allMetadata = await getAll()
  const metadata = allMetadata
    .find(metadata => `${metadata.id}` === hutIdStr)
  return metadata
}

const getByIds = async hutIds => {
  const hutIdsStr = hutIds.map(s => `${s}`)
  const allMetadata = await getAll()
  const metadata = allMetadata
    .filter(metadata => hutIdsStr.includes(`${metadata.id}`))
  return TransformableArray.from(metadata)
}

const findOneByName = async name => {
  const all = await getAll()
  const matches = await all.transform(hutRepo.tx.filterByName(name))
  const first = matches.length > 0
    ? matches[0]
    : null
  return first
}

const compareBy = propertyName => (a, b) => {
  const aVal = a[propertyName], bVal = b[propertyName]
  if (aVal < bVal) return -1
  else if (aVal > bVal) return 1
  else return 0
}
const compareByDesc = propertyName => (a, b) => compareBy(propertyName)(a, b) * -1

const hutRepo = module.exports = {
  getAll,
  getById,
  getByIds,
  findOneByName,
  tx: {
    or: function() { return arr => arr.filter(hut => Array.from(arguments).some(predicate => predicate([hut]).length === 1)) },
    dropNullCoordinates: () => arr => arr.filter(hut => !!hut.coordinates),
    selectNullCoordinates: () => arr => arr.filter(hut => !hut.coordinates),
    filterForOpenAt: dateStrOrMoment => arr => {
      const dateStr = dateStrOrMoment instanceof moment
        ? dateStrOrMoment.format(AO_DATE_FORMAT)
        : dateStrOrMoment
      const allWithReservations = arr.every(hut => Array.isArray(hut.reservations))
      if (!allWithReservations) throw new Error('Huts not joined with reservations')
      return arr.filter(hut => {
        const reservation = hut.reservations.find(reservation => reservation.date === dateStr)
        if (!reservation) return false
        return reservation.closed === false
      })
    },
    filterByCountryCode: countryCode => arr => arr.filter(hut => hut.countryCode === countryCode),
    filterByMinElavation: minElavation => arr => arr.filter(hut => hut.elavation >= minElavation),
    filterByMaxElavation: maxElavation => arr => arr.filter(hut => hut.elavation <= maxElavation),
    filterByHutIds: hutIds => {
      const hutIdsStr = hutIds.map(s => `${s}`)
      return arr => arr.filter(hut => hutIdsStr.includes(`${hut.id}`))
    },
    filterByName: query => arr => {
      const pattern = new RegExp(query, 'gi')
      return arr.filter(hut => {
        // console.log(hut.name, pattern.test(hut.name))
        return pattern.test(hut.name)
      })
    },
    filterByMaxDistanceTo: (centerPoint, maxDistanceInKm) => arr => arr.filter(hut => {
      const distanceInKm = geolib.getDistance(centerPoint, hut.coordinates) / 1000
      return distanceInKm <= maxDistanceInKm
    }),
    rejectCountryCode: countryCode => arr => arr.filter(hut => hut.countryCode !== countryCode),
    appendDistanceFrom: location => arr => arr.map(hut => {
      hut.distance = hut.coordinates
        ? parseFloat(geolib.getDistance(location, hut.coordinates) / 1000)
        : null
      return hut
    }),
    mapToIds: () => arr => arr.map(hut => hut.id),
    mapToCoordinates: () => arr => arr.map(hut => hut.coordinates),
    sortByName: () => arr => arr.sort(compareBy('name')),
    sortByDistance: () => arr => arr.sort(compareBy('distance')),
    joinReservations: () => async arr => {
      const allReservationsByHut = await data.aggregate.reservationsByHutJSON()
      return arr.map(hut => {
        const modHut = {...hut}
        const allReservations = allReservationsByHut['' + hut.id]
        modHut.reservations = [...allReservations]
        return modHut
      })
    },
    filter: {
      and: function() { return hut => Array.from(arguments).all(predicate => predicate(hut)) },
      or: function() { return hut => Array.from(arguments).some(predicate => predicate(hut)) },
      byCountryCode: countryCode => hut => hut.countryCode === countryCode,
      byMaxElavation: maxElavation => hut => hut.elavation <= maxElavation,
      withCoordinates: () => hut => !!hut.coordinates
    },
    map: {
      withDistanceFrom: location => hut => {
        hut.distance = hut.coordinates
          ? parseFloat(geolib.getDistance(location, hut.coordinates) / 1000)
          : null
        return hut
      }
    },
    sort: {
      // multiple: function() { return (a, b) => Array.from(arguments).find(predicate => predicate(a, b) !== 0) || 0 },
      byDistance: () => (a, b) => {
        return a.distance - b.distance
      },
      byName: () => compareBy('name'),
      byId: () => compareBy('id'),
      byCountryCode: () => compareBy('countryCode')
    }
  }
}