'use strict'

const axios = require('axios').default
const path = require('path')

module.exports = pathInDataDirOrFactory => {

  const dataPath = './data'
  const resolve = pathInDataDir => path.resolve(dataPath, pathInDataDir)

  const urlFactory = typeof pathInDataDirOrFactory === 'string'
    ? () => resolve(pathInDataDirOrFactory)
    : function() { return resolve(pathInDataDirOrFactory.apply(null, arguments)) }

  let data = null
  const fn = async function() {
    if (data === null) {
      const filepath = urlFactory.apply(null, arguments)
      const response = await axios({
        method: 'get',
        url: filepath,
        responseType: 'json'
      })
      data = response.data
    }
    return data
  }
  fn.filepath = () => { throw new Error('Not implemented') }
  fn.write = () => { throw new Error('Not implemented') }
  return fn
}