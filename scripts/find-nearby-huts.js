'use strict'

const hutRepo = require('../lib/repo/hut-repo')
const hutPrinter = require('../lib/cli/hut-printer')
const { execute } = require('../lib/util/script-util')

execute(async () => {
  const hut = await hutRepo.findOneByName('augsburger')
  console.log(hut)

  const allHutsWithCoordinates = await (await hutRepo.getAll())
    .transform(
      hutRepo.tx.dropNullCoordinates(),
      hutRepo.tx.filterByMaxDistanceTo(hut.coordinates, 25)
    )
  
  hutPrinter.list(allHutsWithCoordinates)
  
})