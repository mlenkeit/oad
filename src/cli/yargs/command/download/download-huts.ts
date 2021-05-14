import * as yargs from 'yargs'
import alpsonlineClientFactory from './../../../client/alpsonline'
import withManagedBrowser from './../../../puppeteer/managed-browser'
import alpsonlineStorageFactory from './../../../storage/alpsonline-storage'

export default (): yargs.CommandModule => {
  return {
    command: 'huts',
    describe: '',
    // builder: yargs => {

    // },
    handler: async (argv: object) => {
      const alpsonlineClient = alpsonlineClientFactory()
      const alpsonlineStorage = alpsonlineStorageFactory()
      const countryCodes = ['DE', 'IT', 'AT', 'CH', 'SI']

      console.log('downloading', countryCodes)
      const allResults = await withManagedBrowser({}, async ({ browser }) => {
        const allDone = countryCodes.map(async countryCode => {
          const result = await alpsonlineClient.getHutsByCountryCode({ countryCode, options: { browser }})
          alpsonlineStorage.upsertHutsByCountryCode(result)
        })
        const allResults = await Promise.all(allDone)
        return allResults
      })
      // allResults.forEach(it => {
      //   console.log(it.countryCode, it.data.length)
      // })
    }
  }
}