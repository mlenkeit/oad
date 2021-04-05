'use strict'

const React = require('react')
const { useState } = React
const { 
  Box,
  Button,
  Paper,
  Tab,
  Tabs,
  Typography
} = require('@material-ui/core')
const { DataGrid } = require('@material-ui/data-grid')

const HutTable = require('./hut-table')
const HutMap = require('./hut-map')

const columns = [
  { field: 'id', headerName: 'ID', width: 70 },
  { field: 'name', headerName: 'Hut', width: 200 },
  { 
    field: 'flag', 
    headerName: 'Country', 
    width: 70,
    sortabe: false,
    valueGetter: params => {
      const countryCode = params.row.countryCode.toLowerCase()
      if (countryCode === 'de') return '🇩🇪'
      if (countryCode === 'ch') return '🇨🇭'
      if (countryCode === 'at') return '🇦🇹'
      if (countryCode === 'si') return '🇸🇰'
      return 'n/a'
    }
  }
]

const TabPanel = (props) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      {...other}
    >
      {value === index && (
        <Box p={3}>
          {children}
        </Box>
      )}
    </div>
  );
}

module.exports = (props) => {
  const { 
    huts,
    hutsWithCoordinates,
    mapCenter
  } = props

  const [tabIndex, setTabIndex] = useState(0)

  const handleTabChange = (evt, newIndex) => {
    setTabIndex(newIndex)
  }

  return (
    <Paper>
      <Typography component="h2" variant="h6" color="primary" gutterBottom>
        Huts
      </Typography>
      <Tabs value={tabIndex} onChange={handleTabChange}>
        <Tab label={`Table (${huts.length})`} />
        <Tab label={`Map (${hutsWithCoordinates.length})`} />
      </Tabs>
      <TabPanel value={tabIndex} index={0}>
        <div style={{ height: 400, width: '100%' }}>
          <HutTable huts={huts} />
        </div>
      </TabPanel>
      <TabPanel value={tabIndex} index={1}>
        <HutMap huts={hutsWithCoordinates} mapCenter={mapCenter} />
      </TabPanel>
    </Paper>
  )
}