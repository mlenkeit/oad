'use strict'

const isBrowser = require('is-browser')

const cachableJSONFileFactory = isBrowser
  ? require('./util/cachable-json-file-factory-xhr')
  : require('./util/cachable-json-file-factory-fs')

module.exports = {
  aggregate: {
    allDataJSON: cachableJSONFileFactory('./aggregate/all-data.json'),
    hutMetadataJSON: cachableJSONFileFactory('./aggregate/hut-metadata.json'),
    hutsJSON: cachableJSONFileFactory('./aggregate/huts.json'),
    reservationsJSON: cachableJSONFileFactory('./aggregate/reservations.json'),
    reservationsByHutJSON: cachableJSONFileFactory('./aggregate/reservations-by-hut.json')
  },
  custom: {
    hutMetadataJSON: cachableJSONFileFactory('./custom/hut-metadata.json')
  },
  download: {
    hutInfosJSON: cachableJSONFileFactory('./download/hut-infos.json'),
    hutsForCountryCodeJSON: cachableJSONFileFactory(countryCode => `./download/huts-${countryCode.toLowerCase()}.json`),
    reservationsForHutJSON: cachableJSONFileFactory(hutId => `./download/hut-${hutId}.json`)
  }
}