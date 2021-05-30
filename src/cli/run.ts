import util from './util'
import TestRepo from './../common/repo/test-repo'
import HutRepo from './../common/repo/hut-repo'
import TransformableArray from '../common/util/transformable-array'
import alpsonlineClientFactory from './client/alpsonline-client'
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

const myFun1 = function<T, K>(items: T[]): T&K {
  const first = (items[0] as T&K)
  return first
}
const res = myFun1<number, String>([1, 2, 3])


class MyCollection {
  private data: number[]
  private tx: Function[]
  constructor(data: number[], tx: Function[] = []) {
    this.data = data
    this.tx = tx
  }

  filterA (): MyCollection {
    return new MyCollection(this.data, [...this.tx, (data: number[]) => data.filter(it => it > 2)])
  }
  filterB (): MyCollection {
    return new MyCollection(this.data, [...this.tx, (data: number[]) => data.filter(it => it < 10)])
  }

  result (): number[] {
    return this.tx.reduce((data, fn) => {
      return fn(data)
    }, this.data)
  }
}

const main = async () => {
  console.log('main')
  // const huts = await alpsonlineClient.getHutsByCountryCode({ countryCode: 'DE' })
  // console.log(huts)
  // const info = await alpsonlineClient.getHutInfo({ hutId: 81 })
  // console.log(info)
  // console.log(await hutRepo.getAll())
  // const all = await (await hutRepo.getAll())
  //   .transform(
  //     hutRepo.tx.filterByName('2')
  //   )
  // console.log('transformed', all)
  // console.log('ID 2', await hutRepo.getById(2))
  // console.log('ID 1', await hutRepo.getById(1))

  const coll = new MyCollection([1, 4, 7, 10])
  const res = coll
    // .filterA()
    .filterB()
    .result()
  console.log('res', res)

  const getAll = async () : Promise<number[]> => {
    return Promise.resolve([1, 4, 7])
  }

  // const filter



}
// main()
//   .then(() => console.log('DONE'))
//   .catch(console.error)

import cli from './yargs/main'
cli(process.argv.slice(2))