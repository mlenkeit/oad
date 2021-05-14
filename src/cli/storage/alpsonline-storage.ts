import {
  HutsByCountryCodeResult
} from './../client/alpsonline'

import * as path from 'path'
import * as fse from 'fs-extra'
import * as moment from 'moment'

export const storage = () => {
  const dataDirectory = path.resolve(__dirname, '../../../data')

  const upsertHutsByCountryCode = async ({ countryCode, huts }: HutsByCountryCodeResult): Promise<void> => {
    const filename = `huts-${countryCode.toLowerCase()}.json`
    const filepath = path.join(dataDirectory, filename)
    // @ts-ignore
    const data = { countryCode, huts, updatedAt: moment().unix() }
    await fse.writeJSON(filepath, data, { spaces: 2})
  }

  return {
    upsertHutsByCountryCode
  }
}

export default storage