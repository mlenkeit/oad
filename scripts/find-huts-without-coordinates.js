'use strict'

const data = require('./../lib/data')
const hutRepo = require('./../lib/repo/hut-repo')
const hutPrinter = require('./../lib/cli/hut-printer')
const { execute } = require('./../lib/util/script-util')

execute(async () => {
  const huts = await hutRepo.getAll()
  const filteredHuts = await huts.transform(
    hutRepo.tx.selectNullCoordinates(),
    hutRepo.tx.sortByName()
  )
  const allMetadata = await data.download.hutInfosJSON()

  hutPrinter.list(filteredHuts, {
    with: hut => {
      const metadata = allMetadata.find(it => it.hutId === hut.id)
      return metadata.info[4]
    }
  })
})