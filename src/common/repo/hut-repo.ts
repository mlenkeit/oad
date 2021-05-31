import { ArrayTransformation } from './../util/transformable-array'
import hutsStorage from './../../webapp/huts.json'
import QueryBuilder, { ResultTransformation } from './QueryBuilder'
import * as geolib from 'geolib'
import { Reservation, transformReservationArray, transformations as reservationTx, ReservationArrayTransformation } from './reservation-repo'
import * as async from 'async'

export type HutId = number
export type CountryCode = string
export interface Hut {
  id: HutId,
  name: string
  countryCode: CountryCode
  elevation?: number
  coordinates?: {
    latitude: number
    longitude: number
  }
}
export interface HutWithCoordinates extends Hut {
  coordinates: {
    latitude: number
    longitude: number
  }
}

// export type ResultTransformation<T> = {
//   (arr: T[]) : Promise<T[]> | T[]
// }

export interface WithCoordinates {
  coordinates?: {
    latitude: number
    longitude: number
  }
}
export interface WithDistance {
  distance: number
}
export type HutWithDistance = Hut & WithDistance

export interface WithReservations {
  reservations: Reservation[]
}
export type HutWithReservations = Hut & WithReservations

type HutArrayTransformation = ArrayTransformation<Hut>
// type HutResultTransformation = ResultTransformation<Hut>

export class HutQueryBuilder extends QueryBuilder<Hut> {
  protected copy(data: Hut[] | Promise<Hut[]>, tx: ArrayTransformation<Hut>[]): HutQueryBuilder {
    return new HutQueryBuilder(data, tx)
  }
  filterByCountryCode (countryCode: CountryCode): HutQueryBuilder {
    return this.queueFilter(hut => hut.countryCode === countryCode) as HutQueryBuilder
  }
  filterByMaxElevation (maxElevation: number): HutQueryBuilder {
    return this.queueFilter(hut => !!hut.elevation && hut.elevation <= maxElevation) as HutQueryBuilder
  }
  filterByMinElevation (minElevation: number): HutQueryBuilder {
    return this.queueFilter(hut => !!hut.elevation && hut.elevation >= minElevation) as HutQueryBuilder
  }
  filterByName (query: string): HutQueryBuilder {
    const pattern = new RegExp(query, 'gi')
    return this.queueFilter(hut => pattern.test(hut.name)) as HutQueryBuilder
  }
  joinDistanceFrom ({ latitude, longitude}: { latitude: number, longitude: number}): HutQueryBuilder {
    return this.queue(arr => arr.map(hut => {
      if (hut.coordinates) {
        const copy = { ...hut } as HutWithDistance
        copy.distance = geolib.getDistance({ latitude, longitude}, hut.coordinates) / 1000
        return copy
      } else {
        return hut
      }
    })) as HutQueryBuilder
  }
  joinReservations (reservations: Reservation[]): HutQueryBuilder {
    return this.queue(arr => arr.map(it => {
      const copy = { ...it } as HutWithReservations
      // @ts-ignore
      copy.reservations = reservations.filter(({ hutId }) => it.id === hutId)
      return copy
    }).filter(it => it.reservations.length > 0)) as HutQueryBuilder
  }
  rejectEmptyCoordinates (): HutQueryBuilder {
    return this.queueFilter(hut => !!hut.coordinates) as HutQueryBuilder
  }
  sortByDistance (): HutQueryBuilder {
    return this.queueSort(compareBy('distance')) as HutQueryBuilder
  }
  sortById (): HutQueryBuilder {
    return this.queueSort(compareBy('id')) as HutQueryBuilder
  }
  sortByName (): HutQueryBuilder {
    return this.queueSort(compareBy('name')) as HutQueryBuilder
  }
}



// const getAll = async (): Promise<TransformableArray<Hut>> => {
//   return TransformableArray.from([...hutsStorage.huts])
// }
const getAll = (): HutQueryBuilder => {
  return new HutQueryBuilder([...hutsStorage.huts])
  // return TransformableArray.from([...hutsStorage.huts])
}

const getById = async (id: HutId): Promise<Hut|null> => {
  const allHuts = await getAll().apply()
  const hut = allHuts.find(it => it.id === id)
  return hut ?? null
}

const compareBy = (propertyName: string) => (a: any, b: any) => {
  const aVal = a[propertyName], bVal = b[propertyName]
  if (aVal < bVal) return -1
  else if (aVal > bVal) return 1
  else return 0
}

// abstract class Collection<T> {
//   private data: Promise<T[]> | T []
//   private tx: ArrayTransformation<T>[]
//   constructor(data : Promise<T[]> | T [], tx: ArrayTransformation<T>[] = []) {
//     this.data = data
//     this.tx = tx
//   }

//   protected queue (tx: ArrayTransformation<T>): Collection<T> {
//     return this.copy(this.data, [...this.tx, tx])
//   }
//   protected queueFilter(fn: (value: T, index: number, array: T[]) => boolean): Collection<T> {
//     return this.queue(arr => arr.filter(fn))
//   }
//   protected queueSort(comparator: ((a: T, b: T) => number)): Collection<T> {
//     return this.queue(arr => arr.sort(comparator))
//   }

//   protected abstract copy(data: Promise<T[]> | T [], tx: ArrayTransformation<T>[]): Collection<T>;

//   async apply (): Promise<T[]> {
//     const allData = await this.data
//     if (this.tx.length === 0) return [...allData]

//     const arr = await this.tx.reduce(async (arr, fn) => {
//       const newArr = await arr
//       return fn(newArr)
//     }, Promise.resolve(allData))
//     return arr
//   }

// }

// export class HutCollection extends Collection<Hut> {
//   protected copy(data: Hut[] | Promise<Hut[]>, tx: ArrayTransformation<Hut>[]): HutCollection {
//     return new HutCollection(data, tx)
//   }

//   filterByCountryCode (countryCode: CountryCode): HutCollection {
//     return this.queueFilter(hut => hut.countryCode === countryCode) as HutCollection
//   }
//   filterByMaxElevation (maxElevation: number): HutCollection {
//     return this.queueFilter(hut => !!hut.elevation && hut.elevation <= maxElevation) as HutCollection
//   }
//   filterByMinElevation (minElevation: number): HutCollection {
//     return this.queueFilter(hut => !!hut.elevation && hut.elevation >= minElevation) as HutCollection
//   }
//   filterByName (query: string): HutCollection {
//     const pattern = new RegExp(query, 'gi')
//     return this.queueFilter(hut => pattern.test(hut.name)) as HutCollection
//   }
//   joinDistanceFrom ({ latitude, longitude}: { latitude: number, longitude: number}): HutCollection {
//     return this.queue(arr => arr.map(hut => {
//       if (hut.coordinates) {
//         const copy = { ...hut } as HutWithDistance
//         copy.distance = geolib.getDistance({ latitude, longitude}, hut.coordinates) / 1000
//         return copy
//       } else {
//         return hut
//       }
//     })) as HutCollection
//   }
//   sortByDistance (): HutCollection {
//     return this.queueSort(compareBy('distance')) as HutCollection
//   }
//   sortById (): HutCollection {
//     return this.queueSort(compareBy('id')) as HutCollection
//   }
//   sortByName (): HutCollection {
//     return this.queueSort(compareBy('name')) as HutCollection
//   }
// }

// export interface HutRepo {
//   getAll: () => { (): HutQueryBuilder }
//   getById: any
// }

export const transformHutArray = async (huts: Hut[], transformations: HutArrayTransformation[]): Promise<Hut[]> => {
  const transformedHuts = await transformations.reduce(async (arr, fn) => {
      const newArr = await arr
      return fn(newArr)
    }, Promise.resolve(huts))
    return transformedHuts
}

export const transformations = {
  allOf: (...txs: HutArrayTransformation[]): HutArrayTransformation => arr => {
    if (txs.length === 0) return arr
    return async.filter(arr, async hut => {
      return await async.every(txs, async tx => {
        return (await tx([hut])).length === 1
      })
    })
  },
  filterByCountryCode: (countryCode: CountryCode): HutArrayTransformation => arr => {
    return arr.filter(it => it.countryCode === countryCode)
  },
  filterByMaxElevation: (maxElevation: number): HutArrayTransformation => arr => {
    return arr.filter(hut => hut.elevation && hut.elevation <= maxElevation)
  },
  filterByMinElevation: (minElevation: number): HutArrayTransformation => arr => {
    return arr.filter(hut => hut.elevation && hut.elevation >= minElevation)
  },
  joinReservations: (reservations: Reservation[], txs: ReservationArrayTransformation[] = []): HutArrayTransformation => async arr => {
    const hutIds = arr.map(it => it.id)
    const transformedReservations = await transformReservationArray(reservations, [
      reservationTx.filterByHutIds(hutIds),
      ...txs
    ])
    return arr.map(it => {
      const copy = { ...it } as HutWithReservations
      copy.reservations = transformedReservations.filter(({ hutId }) => hutId === it.id)
      return copy
    }).filter(it => it.reservations.length > 0)
  },
  noop: (): HutArrayTransformation => arr => arr,
  oneOf: (...txs: HutArrayTransformation[]): HutArrayTransformation => arr => {
    if (txs.length === 0) return arr
    return async.filter(arr, async hut => {
      return await async.some(txs, async tx => {
        return (await tx([hut])).length === 1
      })
    })
  },
  rejectEmptyCoordinates: (): HutArrayTransformation => arr => {
    return arr.filter(it => !!it.coordinates)
  }
  // or: function() { return arr => arr.filter(hut => Array.from(arguments).some(predicate => predicate([hut]).length === 1)) },
}

const hutRepoFactory = () => {
  return {
    getAll,
    getById,
    tx: {
      filterByCountryCode: (countryCode: CountryCode): HutArrayTransformation => arr => {
        return arr.filter(it => it.countryCode === countryCode)
      },
      filterByMaxElevation: (maxElevation: number): HutArrayTransformation => arr => {
        return arr.filter(hut => hut.elevation && hut.elevation <= maxElevation)
      },
      filterByMinElevation: (minElevation: number): HutArrayTransformation => arr => {
        return arr.filter(hut => hut.elevation && hut.elevation >= minElevation)
      },
      filterByName: (query: string): HutArrayTransformation => arr => {
        const pattern = new RegExp(query, 'gi')
        return arr.filter(hut => pattern.test(hut.name))
      },
      sortById: (): HutArrayTransformation => arr => {
        const comparator = compareBy('id')
        return arr.sort(comparator)
      },
      sortByName: (): HutArrayTransformation => arr => {
        const comparator = compareBy('name')
        return arr.sort(comparator)
      }
    }
  }
}

export default hutRepoFactory