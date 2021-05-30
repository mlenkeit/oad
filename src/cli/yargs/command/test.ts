import * as yargs from 'yargs'
import hutRepoFactory, { HutQueryBuilder, HutWithDistance, transformations as hutTx, transformHutArray } from './../../../common/repo/hut-repo'
import reservationRepoFactory, { transformReservationArray, transformations as reservationTx } from './../../../common/repo/reservation-repo'
import moment from 'moment'

export default (): yargs.CommandModule => {
  return {
    command: 'test',
    describe: '',
    // builder: yargs => yargs
    //   .commandDir('download', {
    //     extensions: ['ts'],
    //     visit: commandObject => commandObject.default()
    //   }),
    handler: async (argv: object) => {
      const hutRepo = hutRepoFactory()
      const reservationRepo = reservationRepoFactory()
      
      // const all = await hutRepo.getAll()
      // const coll = new HutQueryBuilder(all.toArray())
      // console.log('all', all.toArray().length, (await coll.apply()).length)

      // const result = await all.transform(
      //   hutRepo.tx.filterByName('kl'),
      //   hutRepo.tx.filterByCountryCode('DE')
      //   // hutRepo.tx.filterByMinElevation(2000),
      //   // hutRepo.tx.sortByName(),
      //   // hutRepo.tx.sortById(),
      // )
      const home = {
        latitude: 49.47982299640468, longitude: 8.469778153155229
      }
      const result2 = await hutRepo.getAll()
        .filterByName('kl')
        // .filterByCountryCode('DE')
        .joinDistanceFrom(home)
        .joinReservations(await reservationRepo
          .getAll()
          .filterByDateRange(moment('2021-06-01'), moment('2021-06-03'))
          .filterByMinFreeRoom(1)
          .apply()
        )
        .sortById()
        .sortByName()
        .sortByDistance()
        .apply()
      console.log(result2)
      // console.log('result', result.toArray().length)
      console.log('result2', result2.length)

      const result3 = await reservationRepo.getAll()
        .filterByDateRange(moment('2021-06-01'), moment('2021-06-03'))
        // .rejectClosed()
        .filterByMinFreeRoom(1)
        .joinHuts(await hutRepo.getAll().apply())
        .apply()
      console.log('reservations', result3.length, result3[0])

      const result4 = await transformHutArray(await hutRepo.getAll().apply(), [
        hutTx.oneOf(
          hutTx.filterByCountryCode('DE'),
        ),
        // hutTx.allOf(
        //   hutTx.filterByMinElevation(2000),
        //   hutTx.filterByMaxElevation(2200)
        // ),
        hutTx.joinReservations(await reservationRepo.getAll().apply(), [
          reservationTx.rejectClosed(),
        //   reservationTx.filterByDateRange(moment(), moment().add(50, 'days')),
          // reservationTx.filterByMinFreeRoom(1)
        ])
      ])
      // @ts-ignore
      console.log('result4', result4.length, result4[0].reservations.length, result4.map(it => `${it.id} ${it.name} ${it.reservations.length}`))
      console.log(result4[27])

      const result5 = await transformReservationArray(await reservationRepo.getAll().apply(), [
        reservationTx.filterByHutIds([151]),
        reservationTx.rejectClosed(),
        reservationTx.filterByMinFreeRoom(10),
        reservationTx.filterByDate(moment('2021-06-07'))
      ])
      console.log('Watzmannhaus', result5.length, result5.slice(0, 14))
    }
  }
}