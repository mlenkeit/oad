import {
  GetHutInfoResult,
  GetHutsByCountryCodeResult,
  CountryCode,
  GetReservationsResult,
  Hut,
  HutId,
  SelectDateResponseItem,
  AODate
} from '../client/alpsonline-client'

import klaw from 'klaw'
import through2 from 'through2'
import path from 'path'
import fse from 'fs-extra'
import moment from 'moment'

export interface HutsByCountryCodeStorage {
  countryCode: CountryCode
  huts: Hut[]
  updatedAt: moment.Moment
}
export interface HutInfosStorage {
  infos: GetHutInfoResult[]
  updatedAt: moment.Moment
}
export interface ReservationsStorage {
  hutId: HutId
  reservations: {
    date: AODate
    data: SelectDateResponseItem[]
  }[]
  updatedAt: number
}

export const storage = () => {
  const dataDirectory = path.resolve(__dirname, '../../../data/download')
  const filepath = {
    hutsByCountryCode: (countryCode: CountryCode) => path.join(dataDirectory, `huts-${countryCode.toLowerCase()}.json`),
    hutInfos: () => path.join(dataDirectory, 'hut-infos.json'),
    reservations: (hutId: HutId) => path.join(dataDirectory, `reservations-${hutId}.json`)
  }

  const upsertHutsByCountryCode = async ({ countryCode, huts }: GetHutsByCountryCodeResult): Promise<void> => {
    // @ts-ignore
    const updatedAt = moment().toISOString()
    const data = { countryCode, huts, updatedAt }
    await fse.writeJSON(filepath.hutsByCountryCode(countryCode), data, { spaces: 2 })
  }

  const getHutsByCountryCode = async (countryCode: CountryCode): Promise<HutsByCountryCodeStorage> => {
    const data = await fse.readJSON(filepath.hutsByCountryCode(countryCode))
    // @ts-ignore
    data.updatedAt = moment(data.updatedAt)
    return data
  }

  const upsertHutInfos = async (infos: GetHutInfoResult[]): Promise<void> => {
    // @ts-ignore
    const updatedAt = moment().toISOString()
    const data = { infos, updatedAt }
    await fse.writeJSON(filepath.hutInfos(), data, { spaces: 2 })
  }

  const getHutInfos = async (): Promise<HutInfosStorage> => {
    const data = await fse.readJSON(filepath.hutInfos())
    // @ts-ignore
    data.updatedAt = moment(data.updatedAt)
    return data
  }

  const upsertReservations = async ({ hutId, reservations }: GetReservationsResult): Promise<void> => {
    // @ts-ignore
    const updatedAt = moment().toISOString()
    const data = { hutId, reservations, updatedAt }
    await fse.writeJSON(filepath.reservations(hutId), data, { spaces: 2 })
  }

  const getReservations = async (hutId: HutId): Promise<ReservationsStorage> => {
    const data = await fse.readJSON(filepath.reservations(hutId))
    // @ts-ignore
    data.updatedAt = moment(data.updatedAt)
    return data
  }

  const stream = (): NodeJS.ReadableStream => {
    // @ts-ignore
    const stream = klaw(dataDirectory)
      .pipe(through2.obj(function(item, enc, next) {
        if (!item.stats.isDirectory()) this.push(item)
        next()
      }))
      .pipe(through2.obj(function(item, enc, next) {
        fse.readJSON(item.path)
          .then(data => {
            item.data = data
            this.push(item)
            next()
          })
          .catch(() => {
            next()
          })
      }))
      .pipe(through2.obj(function(item, enc, next) {
        if (isHutsByCountryCodeStorage(item.data)) this.emit('hutsByCountryCodeStorage', item)
        else if (isHutInfosStorage(item.data)) this.emit('hutInfosStorage', item)
        else if (isReservationsStorage(item.data)) this.emit('reservationsStorage', item)
        this.push(item)
        next()
      }))
    return stream
  }

  const isHutsByCountryCodeStorage = (data: any): data is HutsByCountryCodeStorage => {
    return data && data.countryCode && Array.isArray(data.huts)
  }
  const isHutInfosStorage = (data: any): data is HutInfosStorage => {
    return data && Array.isArray(data.infos)
  }
  const isReservationsStorage = (data: any): data is ReservationsStorage => {
    return data && data.hutId && Array.isArray(data.reservations)
  }

  return {
    upsertHutsByCountryCode,
    getHutsByCountryCode,
    upsertHutInfos,
    getHutInfos,
    upsertReservations,
    getReservations,
    stream
  }
}

export default storage