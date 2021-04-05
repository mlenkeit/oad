'use strict'

const React = require('react')
const GoogleMapReact = require('google-map-react')

const {
  useState
} = React

const {
  Dialog
} = require('@material-ui/core')

const AnyReactComponent = ({ text }) => <div>{text}</div>
const Marker = props => {
  const {
    text,
    onClick = () => { console.log('hello') }
  } = props
  return (
    <div style={{ 
      position: 'absolute', 
      top: '50%', 
      left: '50%', 
      width: '10px', 
      height: '10px', 
      backgroundColor: 'red',
      border: '2px solid #fff',
      borderRadius: '100%',
      transform: 'translate(-50%, -50%)'
    }} className="marker" title={text} onClick={onClick}>
    </div>
  )
}

module.exports = (props) => {
  const { 
    huts,
    mapCenter
  } = props
  const center = {
    lat: mapCenter ? mapCenter.latitude : null, 
    lng: mapCenter ? mapCenter.longitude : null
  }

  const [ isDialogOpen, setIsDialogOpen ] = useState(false)
  const [ selectedItem, setSelectedItem ] = useState({})

  const handleClick = item => {
    return evt => {
      setSelectedItem(item)
      setIsDialogOpen(true)
    }
  }

  const handleDialogClose = () => setIsDialogOpen(false)

  return (
    <div style={{ height: '50vh', width: '100%' }}>
      <GoogleMapReact
        // bootstrapURLKeys={{ key: 'AIzaSyBIwzALxUPNbatRBj3Xi1Uhp0fFzwWNBkE' }}
        defaultCenter={center}
        defaultZoom={6}
      >
      {huts.map((hut, index) =>
        <Marker
          key={index}
          lat={hut.coordinates.latitude}
          lng={hut.coordinates.longitude}
          text={hut.name}
          onClick={handleClick(hut)}
          />
      )}
      </GoogleMapReact>
      <Dialog open={isDialogOpen} onClose={handleDialogClose}>
        <a href={`https://www.alpsonline.org/reservation/calendar?hut_id=${selectedItem.id}`}>{selectedItem.id} {selectedItem.name}</a>
        
      </Dialog>
    </div>
  )
}