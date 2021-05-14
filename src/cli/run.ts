import util from './util'
import TestRepo from './../common/repo/test-repo'
import HutRepo from './../common/repo/hut-repo'
import TransformableArray from '../common/util/transformable-array'
import alpsonlineClientFactory from './client/alpsonline'
import * as async from 'async'

const testRepo = TestRepo({ store: 8 })
const hutRepo = HutRepo()
const alpsonlineClient = alpsonlineClientFactory()
// const util = require('./src/util.ts')

console.log(
  'hello',
  util.getData(),
  testRepo.getAll()
)

const main = async () => {
  console.log('main')
  // const huts = await alpsonlineClient.getHutsByCountryCode({ countryCode: 'DE' })
  // console.log(huts)
  const info = await alpsonlineClient.getHutInfo({ hutId: 81 })
  console.log(info)
  // console.log(await hutRepo.getAll())
  // const all = await (await hutRepo.getAll())
  //   .transform(
  //     hutRepo.tx.filterByName('2')
  //   )
  // console.log('transformed', all)
  // console.log('ID 2', await hutRepo.getById(2))
  // console.log('ID 1', await hutRepo.getById(1))

  // const res1 = await async.reduce([1,2,3], 0, async function(memo, item) {
  //     return new Promise(resolve => {
  //       process.nextTick(function() {
  //         // @ts-ignore
  //         resolve(memo + item)
  //       })
  //     })
  // });
  // console.log('res1', res1)
  const ops1 = () => new Promise((resolve, reject) => {
    async.reduce([1,2,3], 0, function(memo, item, callback) {
        // pointless async:
        process.nextTick(function() {
            // @ts-ignore
            callback(null, memo + item)
        });
    }, function(err, result) {
        // result is now equal to the last value of memo, which is 6
        // console.log(err, result)
        if (err) return reject(err)
        resolve(result)
    });
  })
  console.log('res2', await ops1())

  


}
// main()
//   .then(() => console.log('DONE'))
//   .catch(console.error)

import cli from './yargs/main'
cli(process.argv.slice(2))