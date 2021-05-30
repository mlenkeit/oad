import TransformableArray, { ArrayTransformation } from '../util/transformable-array'
import reservationsStorage from '../../webapp/reservations.json'
import QueryBuilder, { ResultTransformation } from './QueryBuilder'
import * as geolib from 'geolib'
import { HutId, Hut } from './hut-repo'
import moment from 'moment'
import * as async from 'async'

export interface Reservation {
  hutId: HutId
  date: moment.Moment
  bookingEnabled: boolean
  closed: boolean
  freeRoom: number
}

export interface WithHut {
  hut: Hut
}

export type ReservationWithHut = Reservation & WithHut

export type ReservationArrayTransformation = ArrayTransformation<Reservation>
type ReservationResultTransformation = ResultTransformation<Reservation>

export class ReservationQueryBuilder extends QueryBuilder<Reservation> {
  protected copy(data: Reservation[] | Promise<Reservation[]>, tx: ArrayTransformation<Reservation>[]): ReservationQueryBuilder {
    return new ReservationQueryBuilder(data, tx)
  }

  filterByDateRange (from: moment.Moment, to: moment.Moment): ReservationQueryBuilder {
    return this.queueFilter(it => it.date.isSameOrAfter(from) && it.date.isSameOrBefore(to)) as ReservationQueryBuilder
  }
  filterByMinFreeRoom (minFreeFrom: number): ReservationQueryBuilder {
    return this.queueFilter(it => it.freeRoom >= minFreeFrom) as ReservationQueryBuilder
  }
  rejectClosed (): ReservationQueryBuilder {
    return this.queueFilter(it => it.closed !== true) as ReservationQueryBuilder
  }
  joinHuts (huts: Hut[]): ReservationQueryBuilder {
    return this.queue(arr => arr.map(it => {
      const copy = { ...it } as ReservationWithHut
      // @ts-ignore
      copy.hut = huts.find(({ id }) => it.hutId === id)
      return copy
    }).filter(it => !!it.hut)) as ReservationQueryBuilder
  }
}



// const getAll = async (): Promise<TransformableArray<Hut>> => {
//   return TransformableArray.from([...hutsStorage.huts])
// }
const getAll = (): ReservationQueryBuilder => {
  // @ts-ignore
  return new ReservationQueryBuilder(reservationsStorage.reservations
    .map(it => {
      // @ts-ignore
      it.date = moment(it.date)
      return it
    }))
}

// const getById = async (id: HutId): Promise<Hut|null> => {
//   const allHuts = await getAll().apply()
//   const hut = allHuts.find(it => it.id === id)
//   return hut ?? null
// }

const compareBy = (propertyName: string) => (a: any, b: any) => {
  const aVal = a[propertyName], bVal = b[propertyName]
  if (aVal < bVal) return -1
  else if (aVal > bVal) return 1
  else return 0
}

export const transformReservationArray = async (reservations: Reservation[], transformations: ReservationArrayTransformation[]): Promise<Reservation[]> => {
  const transformed = await transformations.reduce(async (arr, fn) => {
      const newArr = await arr
      return fn(newArr)
    }, Promise.resolve(reservations))
  return transformed
}

export const transformations = {
  filterByDate: (date: moment.Moment): ReservationArrayTransformation => arr => {
    return arr.filter(it => it.date.isSame(date, 'day'))
  },
  filterByDateRange: (from: moment.Moment, to: moment.Moment): ReservationArrayTransformation => arr => {
    return arr.filter(it => it.date.isSameOrAfter(from) && it.date.isSameOrBefore(to))
  },
  filterByHutIds: (hutIds: HutId[]): ReservationArrayTransformation => arr => {
    return arr.filter(it => hutIds.includes(it.hutId))
  },
  filterByMinFreeRoom: (minFreeFrom: number): ReservationArrayTransformation => arr => {
    return arr.filter(it => it.freeRoom >= minFreeFrom)
  },
  rejectClosed: (): ReservationArrayTransformation => arr => {
    return arr.filter(it => it.closed === true)
  }
}

const reservationRepoFactory = () => {
  return {
    getAll,
    // getById,
    tx: {
      // filterByCountryCode: (countryCode: CountryCode): ReservationArrayTransformation => arr => {
      //   return arr.filter(it => it.countryCode === countryCode)
      // },
      // filterByMaxElevation: (maxElevation: number): ReservationArrayTransformation => arr => {
      //   return arr.filter(hut => hut.elevation && hut.elevation <= maxElevation)
      // },
      // filterByMinElevation: (minElevation: number): ReservationArrayTransformation => arr => {
      //   return arr.filter(hut => hut.elevation && hut.elevation >= minElevation)
      // },
      // filterByName: (query: string): ReservationArrayTransformation => arr => {
      //   const pattern = new RegExp(query, 'gi')
      //   return arr.filter(hut => pattern.test(hut.name))
      // },
      // sortById: (): ReservationArrayTransformation => arr => {
      //   const comparator = compareBy('id')
      //   return arr.sort(comparator)
      // },
      // sortByName: (): ReservationArrayTransformation => arr => {
      //   const comparator = compareBy('name')
      //   return arr.sort(comparator)
      // }
    }
  }
}

export default reservationRepoFactory