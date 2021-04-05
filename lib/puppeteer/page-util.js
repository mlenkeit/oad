'use strict'

const async = require('async')

module.exports = page => {
  const $text = async selector => {
    const elementHandle = await page.$(selector)
    const text = await page.evaluate(elementHandle => elementHandle.textContent, elementHandle)
    return text
  }

  const $$text = async selector => {
    const elementHandles = await page.$$(selector)
    const texts = await async.map(elementHandles, async elementHandle => {
      const text = await page.evaluate(elementHandle => elementHandle.textContent, elementHandle)
      return text
    })
    return texts
  }

  return {
    $text,
    $$text
  }
}