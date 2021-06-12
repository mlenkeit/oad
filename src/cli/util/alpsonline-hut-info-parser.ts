import * as geolib from 'geolib'
// @ts-ignore
import * as swissgrid from 'swissgrid'
import * as utm from 'utm'

const isCoordinatesValid = (coordinates: any) => {
  if (!coordinates) return false
  const lat = coordinates.latitude
  const lon = coordinates.longitude
  if (!lat) return false
  if (!lon) return false
  if (lat <= -90 || lat >= 90) return false
  if (lon <= -180 || lat >= 180) return false
  return true
}

const extractCoordinatesFromDegreesMinutesSecondsOrNull = (coordinatesStr: string) => {
  const matchesDegreesMinutesSeconds = /(\d+)°\s*(\d+)[′‘'`]\s*(\d+([\.,]\d+)?)[″“"']{1,2}[\D]+(\d+)°\s*(\d+)[′‘'`]\s*(\d+([\.,]\d+)?)[″“"']{1,2}/.exec(coordinatesStr)
  if (!matchesDegreesMinutesSeconds) return null

  // console.log('Degrees Minutes Seconds', coordinatesStr)
  // console.log(matchesDegreesMinutesSeconds)
  const [
    ,
    latDeg, latMin, latSec,
    ,
    lonDeg, lonMin, lonSec
  ] = matchesDegreesMinutesSeconds
  const lat = `${latDeg}° ${latMin}' ${latSec.replace(',', '.')}" N`
  const lon = `${lonDeg}° ${lonMin}' ${lonSec.replace(',', '.')}" E`
  // console.log(coordinatesStr, lat, lon)
  const latDec = geolib.sexagesimalToDecimal(lat)
  const lonDec = geolib.sexagesimalToDecimal(lon)
  return {
    latitude: latDec, longitude: lonDec
  }
}

const extractCoordinatesFromDegreesMinutesOrNull = (coordinatesStr: string) => {
  const matches = /(\d+)°\s*(\d+)[\.,](\d+)[′‘'`]?[\D]+(\d+)°\s*(\d+)[\.,](\d+)[′‘'`]?/.exec(coordinatesStr)
  // console.log(matches)
  if (!matches) return null

  const [
    ,
    latDeg, latMin, latMinDec,
    lonDeg, lonMin, lonMinDec
  ] = matches
  const lat = `${latDeg}° ${latMin}' ${parseFloat(`0.${latMinDec}`) * 60}" N`
  const lon = `${lonDeg}° ${lonMin}' ${parseFloat(`0.${lonMinDec}`) * 60}" E`
  const latDec = geolib.sexagesimalToDecimal(lat)
  const lonDec = geolib.sexagesimalToDecimal(lon)
  return {
    latitude: latDec, longitude: lonDec
  }
}

const extractCoordinatesFromDecimalDegreesOrNull = (coordinatesStr: string) => {
  const matchesDecimalDegrees = /(\d+)[\.,](\d+)[\D]+(\d+)[\.,](\d+)/.exec(coordinatesStr)
  if (!matchesDecimalDegrees) return null
  
  // console.log('Decimal Degrees', coordinatesStr)
  // console.log(matchesDecimalDegrees)
  const [
    ,
    latInt, latDec,
    lonInt, lonDec
  ] = matchesDecimalDegrees
  const lat = parseFloat(`${latInt}.${latDec}`)
  const lon = parseFloat(`${lonInt}.${lonDec}`)
  return {
    latitude: lat, longitude: lon
  }
}

const extractCoordinatesFromCH1903OrNull = (coordinatesStr: string) => {
  const matches = /\s(\d{2,3})\D?(\d{3})\s?\/\s?(\d{2,3})\D?(\d{3})/.exec(coordinatesStr)
  if (!matches) return null
  // console.log(matches)
  const [
    ,
    yStr1, yStr2, xStr1, xStr2
  ] = matches
  const y = parseInt(`${yStr1}${yStr2}`)
  const x = parseInt(`${xStr1}${xStr2}`)
  // console.log(y, x)
  const [lon, lat] = swissgrid.lv03.unproject([y, x]);
  // console.log(lat, lon)
  return {
    latitude: lat, longitude: lon
  }
}

const extractCoordinatesFromDegreesMinutesSecondsWithoutUnitsOrNull = (coordinatesStr: string) => {
  const matches = /N\s(\d+)\s(\d+)\s(\d+([\.,]\d+)?) E (\d+)\s(\d+)\s(\d+([\.,]\d+)?)/.exec(coordinatesStr)
  if (!matches) return null
  
  const [
    ,
    latDeg, latMin, latSecStr,
    ,
    lonDeg, lonMin, lonSecStr
  ] = matches
  const latSec = latSecStr.replace(',', '.')
  const lonSec = lonSecStr.replace(',', '.')
  const lat = `${latDeg}° ${latMin}' ${latSec.replace(',', '.')}" N`
  const lon = `${lonDeg}° ${lonMin}' ${lonSec.replace(',', '.')}" E`
  const latDec = geolib.sexagesimalToDecimal(lat)
  const lonDec = geolib.sexagesimalToDecimal(lon)
  return {
    latitude: latDec, longitude: lonDec
  }
}

const extractCoordinatesFromUTMOrNull = (coordinatesStr: string) => {
  const matches = /UTM\D+(\d+)\D+(\d+)/.exec(coordinatesStr)
  if (!matches) return null
  // console.log(matches)

  const [
    ,
    northingStr, eastingStr
  ] = matches
  const easting = parseFloat(eastingStr)
  const northing = parseFloat(northingStr)
  const { latitude, longitude } = utm.toLatLon(easting, northing, 32, undefined, true, false)
  // console.log(latitude, longitude)
  return {
    latitude, longitude
  }
}

export const parseCoordinates = (coordinatesStr: string) => {
  const coordinates = [
    extractCoordinatesFromUTMOrNull,
    extractCoordinatesFromCH1903OrNull,
    extractCoordinatesFromDegreesMinutesSecondsOrNull,
    extractCoordinatesFromDegreesMinutesOrNull,
    extractCoordinatesFromDecimalDegreesOrNull,
    extractCoordinatesFromDegreesMinutesSecondsWithoutUnitsOrNull
  ]
    .map(fn => fn(coordinatesStr))
    .find(coordinates => isCoordinatesValid(coordinates))
  // console.log(coordinatesStr, coordinates)
  return coordinates
}

export const parseElevation = (elevationStr: string) => {
  const matches = /(\d+([\.]\d+)?)/.exec(elevationStr)
  if (matches && matches[0]) {
    const tmp = matches[0]
      .replace(' ', '')
      .replace('.', '')
      .replace(',', '')
    const elevation = parseInt(tmp)
    return elevation
  }
  return null
}