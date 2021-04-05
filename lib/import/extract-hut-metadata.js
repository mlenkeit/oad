'use strict'

const hutInfoExtractor = require('./hut-info-extractor')

const extractHutMetadata = hutInfos => {
  return hutInfos
    // .slice(50, 70)
    // .filter(it => it.hutId === 260)
    .map(item => {
      const elavationStr = item.info[3]
      const coordinatesStr = item.info[4]
      const metadata = {
        hutId: item.hutId,
        elavation: hutInfoExtractor.extractElavationOrNull(elavationStr) || null,
        coordinates: hutInfoExtractor.extractCoordinatesOrNull(coordinatesStr) || null
      }
      return metadata
    })
}

module.exports = extractHutMetadata