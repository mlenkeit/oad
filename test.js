'use strict'

const async = require('async')
const TransformableArray = require('./lib/util/transformable-array')

const tx = async arr => async.map(arr, async it => {
    return it * 2
})

const arr = TransformableArray.from([1,2,3])
console.log(arr)
const newArr = arr.transform(
    tx,
    arr => arr.map(it => it * 5)
)
newArr.then(console.log)
