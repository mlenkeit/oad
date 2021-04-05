'use strict'

const fse = require('fs-extra')
const path = require('path')

const DATA_DIR = path.resolve(__dirname, './../../data')
const resolve = pathInDataDir => path.resolve(DATA_DIR, pathInDataDir)

module.exports = pathInDataDirOrFactory => {
  const filepathFactory = typeof pathInDataDirOrFactory === 'string'
    ? () => resolve(pathInDataDirOrFactory)
    : function() { return resolve(pathInDataDirOrFactory.apply(null, arguments)) }

  let data = null
  const fn = async function () {
    if (data === null) {
      const filepath = filepathFactory.apply(null, arguments)
      data = await fse.readJSON(filepath)
    }
    return data
  }
  fn.filepath = filepathFactory
  fn.write = function() {
    const args = Array.from(arguments)
    const obj = args.pop()
    const filepath = filepathFactory.apply(null, args)
    return fse.writeJSON(filepath, obj, { spaces: 2 })
  }
  return fn
}