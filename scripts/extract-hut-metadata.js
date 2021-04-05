'use strict'

const data = require('./../lib/data')
const { execute } = require('./../lib/util/script-util')
const extractHutMetadata = require('../lib/import/extract-hut-metadata')

execute(async () => {
  const infos = await data.download.hutInfosJSON()
  const metadata = extractHutMetadata(infos)
  await data.aggregate.hutMetadataJSON.write(metadata)
})