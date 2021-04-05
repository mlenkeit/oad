'use strict'

const fse = require('fs-extra')
const Mustache = require('mustache')
const path = require('path')

const DEFAULT_TEMPLATE_FILEPATH = path.resolve(__dirname, './map.html.tpl')
const loadDefaultTemplate = async () => {
  const buffer = await fse.readFile(DEFAULT_TEMPLATE_FILEPATH)
  const contents = buffer.toString()
  return contents
}

const generateMapWithMarkers = async ({ tpl, huts }) => {
  const hutsWithCoordinates = huts
    .filter(hut => !!hut.coordinates)
  const markers = hutsWithCoordinates
    .map(hut => {
      return `new google.maps.Marker({
  position: { lat: ${hut.coordinates.latitude}, lng: ${hut.coordinates.longitude} },
  label: '${hut.id}',
  title: "${hut.name}",
  map: map
});`
    })
    .join('\n')
  const html = Mustache.render(tpl, {
    script: markers
  })
  return html
}

const writeMap = async (html, tag) => {
  const filename = tag
    ? `map-${tag.toLowerCase()}.html`
    : 'map.html'
  const filepath = path.resolve(__dirname, `./../../data/gen/${filename}`)
  await fse.writeFile(filepath, html)
}

const writeDefaultMapWithMarkers = async (huts, tag) => {
  const tpl = await loadDefaultTemplate()
  const html = await generateMapWithMarkers({
    tpl, huts
  })
  await writeMap(html, tag)
}

module.exports = {
  loadDefaultTemplate,
  generateMapWithMarkers,
  writeMap,
  writeDefaultMapWithMarkers
}