'use strict'

const chalk = require('chalk')

const countryCodeToEmoji = countryCode => {
  const cc = countryCode.toLowerCase()
  if (cc === 'de') return '🇩🇪'
  if (cc === 'ch') return '🇨🇭'
  if (cc === 'at') return '🇦🇹'
  if (cc === 'it') return '🇮🇹'
  if (cc === 'si') return '🇸🇰'
  return '❓'
}

const list = (huts, options = {}) => {
  const header = `Huts: ${chalk.cyan(huts.length)}
==============================`
  const footer = `==============================
Huts: ${chalk.cyan(huts.length)}`

console.log(header)
huts.forEach(hut => {
  const id = ('' + hut.id).padStart(3)
  const countryCode = countryCodeToEmoji(hut.countryCode)
  const hutStr = `${id} ${countryCode}  ${chalk.cyan(hut.name)} (${hut.elavation}m)`
  const suffix = options.with ? ' - ' + options.with(hut) : ''
  console.log(`${hutStr}${suffix}`)
})
console.log(footer)
}

const formatDistance = distanceAnyFormat => {
  const distance = parseInt(distanceAnyFormat)
  return distance === NaN ? 'n/a' : `${distance} km`
}

module.exports = {
  list,
  formatDistance
}