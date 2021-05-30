import * as async from 'async'
import * as yargs from 'yargs'
import alpsonlineClientFactory, {
  CountryCode, HutId
} from '../../../client/alpsonline-client'
import alpsonlineStorageFactory from '../../../storage/alpsonline-storage'
import moment from 'moment'

export default (): yargs.CommandModule => {
  return {
    command: 'reservations',
    describe: 'download reservations from alpsonline.org',
    // builder: yargs => {

    // },
    handler: async (argv: object) => {
      const alpsonlineClient = alpsonlineClientFactory()
      const alpsonlineStorage = alpsonlineStorageFactory()

      const countryCodes = await alpsonlineClient.getCountryCodes()
      const hutIds: unknown = await async.reduce<CountryCode, HutId[]>(countryCodes, [], async (hutIds, countryCode) => {
        const { huts } = await alpsonlineStorage.getHutsByCountryCode(countryCode)
        return huts.reduce((hutIds, hut) => {
          hutIds.push(hut.id)
          return hutIds
        }, hutIds as HutId[])
      })
      console.log(hutIds)

      // @ts-ignore
      const from = moment('2021-05-15')
      // @ts-ignore
      const to = moment('2021-12-31')

      await async.eachOfLimit(hutIds as HutId[], 5, async (hutId) => {
        const result = await alpsonlineClient.getReservations({
          hutId, from, to
        })
        await alpsonlineStorage.upsertReservations(result)
      })
    }
  }
}