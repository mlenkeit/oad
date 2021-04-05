'use strict'

const geolib = require('geolib')
const React = require('react')

const hutRepo = require('./../../repo/hut-repo')
const HutList = require('./hut-list')
const HutMap = require('./hut-map')

const { 
  AppBar,
  Button,
  Checkbox,
  Chip,
  FormControl,
  FormLabel,
  FormGroup,
  FormControlLabel,
  Grid,
  Input,
  InputAdornment,
  Paper,
  Popper,
  Tab,
  Tabs,
  TextField,
  Toolbar,
  Typography
} = require('@material-ui/core')
const { makeStyles } = require('@material-ui/core/styles')

const {
  MuiPickersUtilsProvider, KeyboardDatePicker,
} = require('@material-ui/pickers')

const MomentUtils = require('@date-io/moment')

const {
  useEffect,
  useState
} = React

module.exports = () => {

  const [ huts, setHuts ] = useState([])
  const [ transformations, setTransformations ] = useState([
    { label: '🇩🇪 DE', tx: hutRepo.tx.filterByCountryCode('DE'), group: 'countryCode', active: false },
    { label: '🇨🇭 CH', tx: hutRepo.tx.filterByCountryCode('CH'), group: 'countryCode', active: false },
    { label: '🇦🇹 AT', tx: hutRepo.tx.filterByCountryCode('AT'), group: 'countryCode', active: false },
    { label: 'Open at', tx: hutRepo.tx.filterForOpenAt, group: 'open', active: false, value: null },
    { label: 'Min. Elavation', tx: hutRepo.tx.filterByMinElavation, group: 'elavation', combinable: true, active: false },
    { label: 'Max. Elavation', tx: hutRepo.tx.filterByMaxElavation, group: 'elavation', combinable: true, active: false },
    { label: 'Max. Elavation 2000', tx: hutRepo.tx.filterByMaxElavation('2000'), active: false }
  ])
  const [ enabledTransformations, setEnabledTransformations ] = useState([])
  const [ disabledTransformations, setDisabledTransformations ] = useState([])
  const [ hutsWithCoordinates, setHutsWithCoordinates] = useState([])
  const [ mapCenter, setMapCenter ] = useState(null)

  // const [anchorEl, setAnchorEl] = useState(null);
  // const [open, setOpen] = useState(false);

  useEffect(async () => {
    console.log(transformations)
    const enabledTransformations = transformations.filter(it => it.active === true)
    setEnabledTransformations(enabledTransformations)
    const disabledTransformations = transformations.filter(it => it.active === false)
    setDisabledTransformations(disabledTransformations)
    
    const txs = enabledTransformations
    .reduce((txs, it) => {
      const realTx = it.value ? it.tx(it.value) : it.tx
      if (!!it.group && it.combinable !== true) {
        const groupItem = txs.find(i => i.group === it.group)
        if (groupItem) groupItem.txs.push(realTx)
        if (!groupItem) txs.push({ group: it.group, txs: [realTx] })
      } else {
        txs.push(realTx)
      }
      return txs
    }, [])
    .map(it => {
      return it.group
        ? hutRepo.tx.or(...it.txs)
        : it
    })
    const huts = txs.length === 0
      ? await hutRepo.getAll()
      : await (await hutRepo.getAll()).transform(hutRepo.tx.joinReservations(), ...txs)
    setHuts(huts)

    const hutsWithCoordinates = await huts
      .transform(hutRepo.tx.dropNullCoordinates())
    setHutsWithCoordinates(hutsWithCoordinates)

    const allCoordinates = await hutsWithCoordinates
      .transform(hutRepo.tx.mapToCoordinates())
    const mapCenter = geolib.getCenter(allCoordinates)
    setMapCenter(mapCenter)
  }, [transformations])

  const enableTransformation = (item) => {
    return () => {
        const newtransformations = transformations.map(it => {
          const newIt = { ...it }
          if (it.label === item.label) newIt.active = true
          return newIt
        })
        setTransformations(newtransformations)
    }
  }

  const disableTransformation = item => {
    return () => {
      const newtransformations = transformations.map(it => {
        const newIt = { ...it }
        if (it.label === item.label) newIt.active = false
        return newIt
      })
      setTransformations(newtransformations)
    }
  }

  const toggleTransformationFromCheckbox = item => {
    return evt => {
      if (evt.target.checked) enableTransformation(item)()
      else disableTransformation(item)()
    }
  }

  const applyTransformationFromTextField = item => {
    return evt => {
      const value = evt.target.value
      if (!!value) {
        item.value = parseInt(value)
        enableTransformation(item)()
      } else {
        delete item.value
        disableTransformation(item)()
      }
      
    }
  }

  // const handleClick = (evt) => {
  //   setOpen(!open)
  //   setAnchorEl(evt.currentTarget)
  // }

  // const handleSubmit = evt => {
  //   debugger
  // }

  const handleOpen = item => {
    return openAt => {
      if (!openAt) {
        item.value = null
        disableTransformation(item)()
      } else {
        item.value = openAt
        enableTransformation(item)()
      }
    }
  }

  return (
    <div>
      {/* <Popper open={open} anchorEl={anchorEl}>
        <Paper>
          <form target='#' onSubmit={this.handleSubmit}>
            <TextField id='test' label='Elavation' autoFocus='true' />
            <Button type='submit'>Submit</Button>
          </form>
        </Paper>
      </Popper> */}
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6">Open Alpine Data3</Typography>
        </Toolbar>
      </AppBar>
      <br />
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper>
            <Typography component="h2" variant="h6" color="primary" gutterBottom>
              Filters
            </Typography>

            <Grid container spacing={3}>
              <Grid item xs={3}>
                <FormControl component="fieldset">
                  <FormLabel component="legend">Countries</FormLabel>
                  <FormGroup>
                  {transformations.filter(it => it.group === 'countryCode').map(it =>
                    <FormControlLabel
                      control={<Checkbox checked={it.active} name={it.label} onChange={toggleTransformationFromCheckbox(it)} />}
                      label={it.label}
                    />
                  )}
                  </FormGroup>
                </FormControl>
              </Grid>
              <Grid item xs={3}>
                <FormControl component="fieldset">
                  <FormLabel component="legend">Elavation</FormLabel>
                  {transformations.filter(it => it.group === 'elavation').map(it =>
                  <TextField
                      label={it.label}
                      onChange={applyTransformationFromTextField(it)}
                      InputProps={{
                        endAdornment: <InputAdornment position="end">m</InputAdornment>,
                      }}
                    />
                  )}
                </FormControl>
              </Grid>
              <Grid item xs={3}>
                <FormControl component="fieldset">
                  <FormLabel component="legend">Reservations</FormLabel>
                  {transformations.filter(it => it.group === 'open').map(it =>
                  <MuiPickersUtilsProvider utils={MomentUtils}>
                    <KeyboardDatePicker
                      disableToolbar
                      autoOk={true}
                      variant="inline"
                      format="DD.MM.YYYY"
                      margin="normal"
                      label={it.label}
                      value={it.value}
                      onChange={handleOpen(it)}
                      // KeyboardButtonProps={{
                      //   'aria-label': 'change date',
                      // }}
                    />
                  </MuiPickersUtilsProvider>
                  )}
                </FormControl>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
        
      <br />
      {/* {txs.map(it =>
      <Chip label={it.label} onClick={addTransformation(it)} />
      )} */}
      {disabledTransformations.map(it =>
      <Chip key={it.label} label={it.label} onClick={enableTransformation(it)} />
      )}
      {/* <Chip label="click me" onClick={handleClick} /> */}
      <br />
      <span>Active filters:</span>
      {enabledTransformations.map(it =>
      <Chip key={it.label} label={it.label} onDelete={disableTransformation(it)} />
      )}
      <HutList huts={huts} hutsWithCoordinates={hutsWithCoordinates} mapCenter={mapCenter} />
    </div>
  )
}