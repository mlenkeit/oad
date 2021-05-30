import * as yargs from 'yargs'
import alpsonlineClientFactory, { CountryCode, GetHutInfoResult } from '../../../client/alpsonline-client'
import alpsonlineStorageFactory from '../../../storage/alpsonline-storage'
import * as async from 'async'

export default (): yargs.CommandModule => {
  return {
    command: 'hut-infos',
    describe: 'download hut infos from alpsonline.org',
    // builder: yargs => {

    // },
    handler: async (argv: object) => {
      const alpsonlineClient = alpsonlineClientFactory()
      const alpsonlineStorage = alpsonlineStorageFactory()

      const countryCodes = await alpsonlineClient.getCountryCodes()
      const hutIds: unknown = await async.reduce<CountryCode, number[]>(countryCodes, [], async (hutIds, countryCode) => {
        const { huts } = await alpsonlineStorage.getHutsByCountryCode(countryCode)
        return huts.reduce((hutIds, hut) => {
          hutIds.push(hut.id)
          return hutIds
        }, hutIds as number[])
      })

      const hutInfos = await async.mapLimit<number, GetHutInfoResult>(hutIds as number[], 5, async hutId => {
        return await alpsonlineClient.getHutInfo({ hutId })
      })
      await alpsonlineStorage.upsertHutInfos(hutInfos)
    }
  }
}