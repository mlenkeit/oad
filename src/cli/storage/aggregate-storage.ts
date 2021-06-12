import path from 'path'
import fse from 'fs-extra'
import moment from 'moment'
import { CountryCode, HutId } from '../client/alpsonline-client'

export interface Hut {
  id: HutId
  name: string
  countryCode: CountryCode
  elevation?: number
  coordinates?: {
    latitude: number
    longitude: number
  }
}
export interface HutsStorage {
  huts: Hut[]
  updatedAt: moment.Moment
}
export interface Reservation {
  hutId: HutId
  date: moment.Moment
  bookingEnabled: boolean
  closed: boolean
  freeRoom: number
}
export interface ReservationsStorage {
  reservations: Reservation[]
  updatedAt: moment.Moment
}

export const storage = () => {
  // const dataDirectory = path.resolve(__dirname, '../../../data/aggregate')
  const dataDirectory = path.resolve(__dirname, '../../../src/webapp')
  const filepath = {
    hutsStorage: () => path.join(dataDirectory, 'huts.json'),
    reservationsStorage: () => path.join(dataDirectory, 'reservations.json')
  }

  const upsertHuts = async (huts: Hut[]): Promise<void> => {
    // @ts-ignore
    const updatedAt = moment().toISOString()
    const data = { huts, updatedAt }
    await fse.writeJSON(filepath.hutsStorage(), data, { spaces: 2 })
  }

  const getHuts = async (): Promise<HutsStorage> => {
    const data = await fse.readJSON(filepath.hutsStorage())
    // @ts-ignore
    data.updatedAt = moment(data.updatedAt)
    return data
  }

  const upsertReservations = async (reservations: Reservation[]): Promise<void> => {
    // @ts-ignore
    const updatedAt = moment().toISOString()
    const data = { reservations, updatedAt }
    await fse.writeJSON(filepath.reservationsStorage(), data, { spaces: 2 })
  }

  const getReservations = async (): Promise<ReservationsStorage> => {
    const data = await fse.readJSON(filepath.reservationsStorage())
    // @ts-ignore
    data.updatedAt = moment(data.updatedAt)
    return data
  }

  return {
    getHuts,
    upsertHuts,
    upsertReservations,
    getReservations
  }
}

export default storage