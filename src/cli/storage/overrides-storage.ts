import * as path from 'path'
import * as fse from 'fs-extra'
import { HutId } from '../client/alpsonline-client'

export interface Hut {
  hutId: HutId
  coordinates?: {
    latitude: number
    longitude: number
  }
}
export type HutMetadataStorage = Hut[]

export const storage = () => {
  const dataDirectory = path.resolve(__dirname, '../../../data/overrides')
  const filepath = {
    hutsStorage: () => path.join(dataDirectory, 'hut-metadata.json')
  }

  const getHutMetadata = async (): Promise<HutMetadataStorage> => {
    const data = await fse.readJSON(filepath.hutsStorage())
    return data
  }

  return {
    getHutMetadata
  }
}

export default storage