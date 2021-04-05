'use strict'

const moment = require('moment')

const execute = fn => {
  const startTime = moment()
  fn()
  .then(() => {
      const endTime = moment()
      const diff = endTime.diff(startTime, 'seconds')
      console.log('')
      console.log(`Done in ${diff} seconds.`)
    })
    .catch(err => console.error(err))
}

module.exports = {
  execute
}