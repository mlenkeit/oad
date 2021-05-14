import * as yargs from 'yargs'
import alpsonlineClientFactory from '../../../client/alpsonline'
import withManagedBrowser from '../../../puppeteer/managed-browser'
import alpsonlineStorageFactory from '../../../storage/alpsonline-storage'
import * as async from 'async'
import * as fse from 'fs-extra'

export default (): yargs.CommandModule => {
  return {
    command: 'hut-infos',
    describe: '',
    // builder: yargs => {

    // },
    handler: async (argv: object) => {
      const d = await fse.readJSON('/Users/d053370/workspaces/github/mlenkeit/oad-new/data/huts-it.json')
      const hutIds: number[] = d.huts.map((it: any) => it.id)

      const alpsonlineClient = alpsonlineClientFactory()
      const alpsonlineStorage = alpsonlineStorageFactory()
      // const countryCodes = ['DE', 'IT', 'AT', 'CH', 'SI']

      console.log('downloading', hutIds)
      const hutInfos = await async.mapLimit(hutIds, 5, async hutId => {
        const hutInfos = await alpsonlineClient.getHutInfo({ hutId })
        return hutInfos
      })
      // const op = () => new Promise((resolve, reject) => {
      //   async.mapLimit(hutIds, 5, (hutId, callback) => {
      //     alpsonlineClient.getHutInfo({ hutId })
      //       .then(data => callback(null, data))
      //       .catch(err => callback(err))
      //   }, (err, data) => {
      //     if (err) return reject(err)
      //     resolve(data)
      //   })
      // })
      // const wpr = (fn) => {
      //   return async (hutId, callback) => {
      //     fn(hutId).then(res => callback(null, res))
      //     .catch(err => callback(err))
      //   }
      // }
      // const op = () => new Promise((resolve, reject) => {
      //   async.mapLimit(hutIds, 5, wpr(async hutId => {
      //     return alpsonlineClient.getHutInfo({ hutId })
      //       // .then(data => callback(null, data))
      //       // .catch(err => callback(err))
      //   }), (err, data) => {
      //     if (err) return reject(err)
      //     resolve(data)
      //   })
      // })
      // const hutInfos = await op()
      console.log(hutInfos)

      // const allResults = await withManagedBrowser({}, async ({ browser }) => {
      //   const allDone = countryCodes.map(async countryCode => {
      //     const result = await alpsonlineClient.getHutsByCountryCode({ countryCode, options: { browser }})
      //     alpsonlineStorage.upsertHutsByCountryCode(result)
      //   })
      //   const allResults = await Promise.all(allDone)
      //   return allResults
      // })
      // allResults.forEach(it => {
      //   console.log(it.countryCode, it.data.length)
      // })
    }
  }
}