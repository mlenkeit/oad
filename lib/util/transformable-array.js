'use strict'

const async = require('async')

class TransformableArray extends Array {

  static from() {
    return new TransformableArray(...Array.from.apply(null, arguments))
  }

  async transform() {
    const arr = await async.reduce(Array.from(arguments), this, async (arr, fn) => {
      // console.log(fn, typeof fn)
      return TransformableArray.from(await fn(arr))
    })
    return arr
    return Array.from(arguments).reduce((arr, fn) => {
      return TransformableArray.from(fn(arr))
    }, this)
  }
}

module.exports = TransformableArray