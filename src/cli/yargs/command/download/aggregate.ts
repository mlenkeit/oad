import { CommandModule } from 'yargs'
import alpsonlineStorageFactory, { HutInfosStorage, HutsByCountryCodeStorage, ReservationsStorage } from '../../../storage/alpsonline-storage'
import overridesStorageFactory from '../../../storage/overrides-storage'
import aggregateStorageFactory, { Hut, Reservation } from '../../../storage/aggregate-storage'
import { parseCoordinates, parseElevation } from './../../../util/alpsonline-hut-info-parser'
import moment from 'moment'

export default (): CommandModule => {
  return {
    command: 'aggregate',
    describe: 'download huts from alpsonline.org',
    // builder: yargs => {

    // },
    handler: async (argv: object) => {
      const aggregateStorage = aggregateStorageFactory()
      const alpsonlineStorage = alpsonlineStorageFactory()
      const overridesStorage = overridesStorageFactory()

      const allHuts: Hut[] = []
      const allReservations: Reservation[] = []
      const elevationMap = new Map()
      const coordinatesMap = new Map()
      const hutMetadataOverrides = await overridesStorage.getHutMetadata()

      alpsonlineStorage.stream()
        .on('hutsByCountryCodeStorage', ({ data }: { data: HutsByCountryCodeStorage }) => {
          data.huts.forEach(it => {
            allHuts.push({
              id: it.id,
              name: it.name,
              countryCode: data.countryCode
            })
          })
          console.log(allHuts.length)
        })
        .on('hutInfosStorage', ({ data }: { data: HutInfosStorage }) => {
          data.infos.forEach(it => {
            elevationMap.set(it.id, parseElevation(it.info[3]))
            coordinatesMap.set(it.id, parseCoordinates(it.info[4]))
          })
        })
        .on('reservationsStorage', ({ data }: { data: ReservationsStorage }) => {
          if (data.hutId === 151) console.log(data.reservations[10])
          data.reservations.forEach(it => {
            // @ts-ignore
            const date = moment(it.date, 'DD.MM.YYYY')
            const r = {
              hutId: data.hutId,
              date,
              bookingEnabled: it.data[0].bookingEnabled,
              closed: it.data[0].bookingEnabled,
              freeRoom: it.data
                .filter(it => it.closed === false)
                .reduce((total, it) => total + it.freeRoom, 0)
            }
            if (data.hutId === 151 && it.date === '09.06.2021') console.log(r)
            allReservations.push(r)
          })
        })
        
        .on('data', () => { /* noop to pretend consumption */ })
        .on('end', async () => {
          const hutsToSage = allHuts.map(it => {
            const clone = { ...it }
            const override = hutMetadataOverrides
              .find(it => it.hutId === clone.id)
            if (override) {
              if (override.coordinates && !clone.coordinates) {
                clone.coordinates = { ...override.coordinates }
              }
            }

            const elevation = elevationMap.get(it.id)
            if (elevation && !clone.elevation) {
              clone.elevation = elevation
            }

            const coordinates = coordinatesMap.get(it.id)
            if (coordinates && !clone.coordinates) {
              clone.coordinates = { ...coordinates }
            }

            return clone
          })
          await aggregateStorage.upsertHuts(hutsToSage)
          await aggregateStorage.upsertReservations(allReservations)
          console.log('end')
        })
        .on('error', (err: Error) => {
          console.log('error', err)
        })
    }
  }
}