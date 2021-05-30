import * as async from 'async'
import * as yargs from 'yargs'
import alpsonlineClientFactory from '../../../client/alpsonline-client'
import alpsonlineStorageFactory from './../../../storage/alpsonline-storage'

export default (): yargs.CommandModule => {
  return {
    command: 'huts',
    describe: 'download huts from alpsonline.org',
    // builder: yargs => {

    // },
    handler: async (argv: object) => {
      const alpsonlineClient = alpsonlineClientFactory()
      const alpsonlineStorage = alpsonlineStorageFactory()

      const countryCodes = await alpsonlineClient.getCountryCodes()
      await async.eachLimit(countryCodes, 5, async (countryCode) => {
        const result = await alpsonlineClient.getHutsByCountryCode({ countryCode })
        alpsonlineStorage.upsertHutsByCountryCode(result)
      })
    }
  }
}