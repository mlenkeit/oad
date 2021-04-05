'use strict'

const merge = require('merge')

const data = require('../data')

const isCoordinatesValid = coordinates => {
  if (!coordinates) return false
  const lat = coordinates.latitude
  const lon = coordinates.longitude
  if (!lat) return false
  if (!lon) return false
  if (lat <= -90 || lat >= 90) return false
  if (lon <= -180 || lat >= 180) return false
  return true
}

const getAll = async () => {
  const aggregateMetadata = await data.aggregate.hutMetadataJSON()
  const customMetadata = await data.custom.hutMetadataJSON()

  const allMetadata = aggregateMetadata
    .map(metadata => {
      const hutId = metadata.hutId
      const custom = customMetadata.find(it => it.hutId === hutId)
      if (custom) {
        metadata = merge.recursive(true, metadata, custom)
      } 

      // if (!isCoordinatesValid(metadata.coordinates)) metadata.coordinates = null

      return metadata
    })
  return allMetadata
}

const get = async hutId => {
  const allMetadata = await getAll()
  const metadata = allMetadata
    .find(metadata => metadata.hutId === hutId)
  return metadata
}

module.exports = {
  getAll,
  get
}