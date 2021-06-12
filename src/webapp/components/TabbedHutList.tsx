import React, { useState } from 'react'
import Box from '@material-ui/core/Box'
import Tab from '@material-ui/core/Tab'
import Tabs from '@material-ui/core/Tabs'
import HutMap from './HutMap'
import HutTable from './HutList'

const TabPanel = (props: any) => {
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

const TabbedHutList = (props: any) => {
  const { 
    huts
  } = props

  const [tabIndex, setTabIndex] = useState(0)
  const handleTabChange = (evt: any, newIndex: number) => {
    setTabIndex(newIndex)
  }

  return (
    <React.Fragment>
      <div>
        <Tabs value={tabIndex} onChange={handleTabChange}>
          <Tab label={`Table (${huts.length})`} />
          <Tab label={`Map (${huts.length})`} />
        </Tabs>
        <TabPanel value={tabIndex} index={0}>
          <div style={{ width: '100%' }}>
            <HutTable huts={huts} />
          </div>
        </TabPanel>
        <TabPanel value={tabIndex} index={1}>
          {/* <HutMap huts={hutsWithCoordinates} mapCenter={mapCenter} /> */}
          <div style={{ display: 'flex', height: '80vh' }}>
            <div style={{ flexGrow: 1 }}>
              <HutMap huts={huts} />
              {/* <HutTable huts={huts} /> */}
            </div>
          </div>
        </TabPanel>
        </div>
    </React.Fragment>
  )
}

export default TabbedHutList