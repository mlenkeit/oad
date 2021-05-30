import React from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import { Hut } from './../../common/repo/hut-repo'
import { LatLngExpression } from 'leaflet'

const {
  useState
} = React

const {
  Dialog
} = require('@material-ui/core')


const HutMap = (props: any) => {
  const { 
    huts,
    mapCenter
  } = props
  const center = {
    lat: mapCenter ? mapCenter.latitude : null, 
    lng: mapCenter ? mapCenter.longitude : null
  }

  const position = [47.505, 12.09] as LatLngExpression

  return (
    <MapContainer center={position} zoom={7} scrollWheelZoom={true} style={{height: '100%'}}>
      <TileLayer
        attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {huts.map((hut: Hut, index: any) =>
        <Marker
          key={index}
          position={[hut.coordinates?.latitude, hut.coordinates?.longitude] as LatLngExpression}
        >
          <Popup>
            <a href={`https://www.alpsonline.org/reservation/calendar?hut_id=${hut.id}`}>{hut.name}</a>
          </Popup>
        </Marker>
      )}
    </MapContainer>
  )
}

export default HutMap