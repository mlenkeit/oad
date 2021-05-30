import logo from './logo.svg';
import './App.css';

import React, { useState, useEffect } from 'react'
import clsx from 'clsx'
import { makeStyles } from '@material-ui/core/styles'
import CssBaseline from '@material-ui/core/CssBaseline';
import Drawer from '@material-ui/core/Drawer';
import Box from '@material-ui/core/Box';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import List from '@material-ui/core/List';
import Typography from '@material-ui/core/Typography';
import Divider from '@material-ui/core/Divider';
import IconButton from '@material-ui/core/IconButton';
import Badge from '@material-ui/core/Badge';
import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import Link from '@material-ui/core/Link';
import MenuIcon from '@material-ui/icons/Menu';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import NotificationsIcon from '@material-ui/icons/Notifications';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import FormControl from '@material-ui/core/FormControl';
import FormLabel from '@material-ui/core/FormLabel';
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import TextField from '@material-ui/core/TextField';
import InputAdornment from '@material-ui/core/InputAdornment';

import MomentUtils from '@date-io/moment';
import {
  MuiPickersUtilsProvider, KeyboardDatePicker
} from '@material-ui/pickers'

import HutMap from './components/HutMap'
import HutTable from './components/HutTable'
import hutRepoFactory, { HutQueryBuilder, HutWithDistance, Hut, transformHutArray, transformations as hutTx } from './../common/repo/hut-repo'
import reservationRepoFactory, { transformations as reservationTx } from './../common/repo/reservation-repo'

const hutRepo = hutRepoFactory()
const reservationRepo = reservationRepoFactory()

const drawerWidth = 240
const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
  },
  toolbar: {
    paddingRight: 24, // keep right padding when drawer closed
  },
  toolbarIcon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    padding: '0 8px',
    ...theme.mixins.toolbar,
  },
  appBar: {
    zIndex: theme.zIndex.drawer + 1,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
  },
  appBarShift: {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  menuButton: {
    marginRight: 36,
  },
  menuButtonHidden: {
    display: 'none',
  },
  title: {
    flexGrow: 1,
  },
  drawerPaper: {
    position: 'relative',
    whiteSpace: 'nowrap',
    width: drawerWidth,
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  drawerPaperClose: {
    overflowX: 'hidden',
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    width: theme.spacing(7),
    [theme.breakpoints.up('sm')]: {
      width: theme.spacing(9),
    },
  },
  appBarSpacer: theme.mixins.toolbar,
  content: {
    flexGrow: 1,
    height: '100vh',
    overflow: 'auto',
  },
  container: {
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(4),
  },
  paper: {
    padding: theme.spacing(2),
    display: 'flex',
    overflow: 'auto',
    flexDirection: 'column',
  },
  fixedHeight: {
    height: 340,
  },
}))

function App() {
  const classes = useStyles()
  const [open, setOpen] = React.useState(true)
  const handleDrawerOpen = () => {
    setOpen(true);
  };
  const handleDrawerClose = () => {
    setOpen(false);
  };
  const fixedHeightPaper = clsx(classes.paper, classes.fixedHeight);

  const [ huts, setHuts ] = useState<Hut[]>([])

  const [ countryCodeFilters, setCountryCodeFilters ] = useState([
    { label: '🇩🇪 DE', tx: hutTx.filterByCountryCode, value: 'DE', active: false }, 
    { label: '🇨🇭 CH', tx: hutTx.filterByCountryCode, value: 'CH', active: false }, 
    { label: '🇦🇹 AT', tx: hutTx.filterByCountryCode, value: 'AT', active: false }, 
  ])

  const [ elevationFilters, setElevationFilters ] = useState([
    { label: 'Min. Elevation', tx: hutTx.filterByMinElevation, value: null, active: false },
    { label: 'Max. Elevation', tx: hutTx.filterByMaxElevation, value: null, active: false }
  ])

  const [ reservationDateFilter, setReservationDateFilter ] = useState(
    { label: 'Reservation Date', tx: reservationTx.filterByDateRange, value: null, active: false }
  )
  const [ freeRoomFilter, setFreeRoomFilter ] = useState(
    { label: 'Free Room', tx: reservationTx.filterByMinFreeRoom, value: null, active: false }
  )

  const [ transformations, setTransformations ] = useState([
    { label: '🇩🇪 DE', group: 'countryCode', active: false, tx: hutTx.filterByCountryCode('DE'), value: 'DE' },
    { label: '🇨🇭 CH', group: 'countryCode', active: false, tx: hutTx.filterByCountryCode('CH'), value: 'CH' },
    { label: '🇦🇹 AT', group: 'countryCode', active: false, tx: hutTx.filterByCountryCode('AT'), value: 'AT' },
    { label: 'Min. Elevation', tx: hutTx.noop(), txFromInput: hutTx.filterByMinElevation, group: 'elevation', combinable: true, active: false, value: null },
    { label: 'Max. Elevation', tx: hutTx.noop(), txFromInput: hutTx.filterByMaxElevation, group: 'elevation', combinable: true, active: false, value: null },
    { label: 'Reservation Date', tx: hutTx.noop(), txFromInput: hutTx.filterByMaxElevation, group: 'availability', active: false, value: null },
    { label: 'Free Room', tx: hutTx.noop(), txFromInput: hutTx.filterByMaxElevation, group: 'availability', active: false, value: null },
  ])
  
  useEffect(() => {
    const fetchHuts = async () => {
      console.log('reservationDateFilter', reservationDateFilter)
      const allHuts = await hutRepo.getAll().apply()
      // const filteredHuts = await transformHutArray(allHuts, transformations
      //     .filter(it => it.active === true)
      //     .map(it => it.tx))
      const filteredHuts = await transformHutArray(allHuts, [
        hutTx.rejectEmptyCoordinates(),
        hutTx.oneOf(...countryCodeFilters
          .filter(it => it.active === true)
          .map(it => it.tx(it.value))),
        hutTx.allOf(...elevationFilters
          .filter(it => it.active === true)
          .map(it => it.tx((it.value as unknown) as number))),
        ...(reservationDateFilter.value !== null && freeRoomFilter !== null
          ? [hutTx.joinReservations(await reservationRepo.getAll().apply(), [
              reservationTx.rejectClosed(),
              reservationTx.filterByDate((reservationDateFilter.value as unknown) as any),
              reservationTx.filterByMinFreeRoom((freeRoomFilter.value as unknown) as number)
            ])]
          : [])
      ])
      setHuts(filteredHuts)
    }
    fetchHuts()
  }, [ countryCodeFilters, elevationFilters, reservationDateFilter, freeRoomFilter ])

  const toggleCountryCode = (item: any) => {
    return (evt: any) => {
      setCountryCodeFilters(countryCodeFilters.map(it => {
        const copy = { ...it }
        if (copy.label === item.label) {
          copy.active = !item.active
        }
        return copy
      }))
    }
  }

  const updateElevation = (item: any) => {
    return (evt: any) => {
      const value = evt.target.value
      if (!!value) {
        setElevationFilters(elevationFilters.map(it => {
          const copy = { ...it }
          if (copy.label === item.label) {
            // @ts-ignore
            copy.value = parseInt(value)
            copy.active = true
          }
          return copy
        }))
      } else {
        setElevationFilters(elevationFilters.map(it => {
          const copy = { ...it }
          if (copy.label === item.label) {
            delete item.value
            copy.active = false
          }
          return copy
        }))
      }
    }
  }
  const updateFreeRoom = (item: any) => {
    return (evt: any) => {
      const value = evt.target.value
      const copy = { ...item }
      if (!!value) copy.value = parseInt(value)
      else item.value = null
      setFreeRoomFilter(copy)
    }
  }

  const handleOpen = (it: any) => {
    return (openAt: any) => {
      console.log(openAt)
      const copy = { ...it }
      copy.value = openAt
      setReservationDateFilter(copy)
    }
  }

  return (
    <div className={classes.root}>
      <CssBaseline />
      <AppBar position="absolute" className={clsx(classes.appBar, open && classes.appBarShift)}>
        <Toolbar className={classes.toolbar}>
          <IconButton
            edge="start"
            color="inherit"
            aria-label="open drawer"
            onClick={handleDrawerOpen}
            className={clsx(classes.menuButton, open && classes.menuButtonHidden)}
          >
            <MenuIcon />
          </IconButton>
          <Typography component="h1" variant="h6" color="inherit" noWrap className={classes.title}>
            Open Alpine Data
          </Typography>
          {/* <IconButton color="inherit">
            <Badge badgeContent={4} color="secondary">
              <NotificationsIcon />
            </Badge>
          </IconButton> */}
        </Toolbar>
      </AppBar>
      <Drawer
        variant="permanent"
        classes={{
          paper: clsx(classes.drawerPaper, !open && classes.drawerPaperClose),
        }}
        open={open}
      >
        <div className={classes.toolbarIcon}>
          <IconButton onClick={handleDrawerClose}>
            <ChevronLeftIcon />
          </IconButton>
        </div>
        <Divider />
        <List>
        <div>
          <ListItem button>
            <ListItemText>Home</ListItemText>
          </ListItem>
        </div>
        </List>
      </Drawer>
      <main className={classes.content}>
        <div className={classes.appBarSpacer} />
        <Container maxWidth="lg" className={classes.container}>
          <Grid container spacing={3}>
            {/* Chart */}
            <Grid item xs={12}>
              <Paper className={classes.paper}>
                <Typography component="h2" variant="h6" color="primary" gutterBottom>
                  Filter
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={3}>
                    <FormControl component="fieldset">
                      <FormLabel component="legend">Countries</FormLabel>
                      <FormGroup>
                      {countryCodeFilters.map(it =>
                        <FormControlLabel
                          control={<Checkbox checked={it.active} name={it.label} onChange={toggleCountryCode(it)} />}
                          label={it.label}
                        />
                      )}
                      </FormGroup>
                    </FormControl>
                  </Grid>
                  <Grid item xs={3}>
                    <FormControl component="fieldset">
                      <FormLabel component="legend">Elevation</FormLabel>
                      <FormGroup>
                      {elevationFilters.map(it =>
                        <TextField
                          label={it.label}
                          onChange={updateElevation(it)}
                          InputProps={{
                            endAdornment: <InputAdornment position="end">m</InputAdornment>,
                          }}
                        />
                      )}
                      </FormGroup>
                    </FormControl>
                  </Grid>
                  <Grid item xs={3}>
                    <FormControl component="fieldset">
                      <FormLabel component="legend">Availability</FormLabel>
                      <FormGroup>
                      <MuiPickersUtilsProvider utils={MomentUtils}>
                        <KeyboardDatePicker
                          disableToolbar
                          autoOk={true}
                          variant="inline"
                          format="DD.MM.YYYY"
                          margin="normal"
                          label="Date"
                          value={reservationDateFilter.value}
                          onChange={handleOpen(reservationDateFilter)}
                          // KeyboardButtonProps={{
                          //   'aria-label': 'change date',
                          // }}
                        />
                      </MuiPickersUtilsProvider>
                      <TextField
                        label="Free Room"
                        onChange={updateFreeRoom(freeRoomFilter)}
                        InputProps={{
                          endAdornment: <InputAdornment position="end">m</InputAdornment>,
                        }} />
                      </FormGroup>
                    </FormControl>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
            {/* Recent Orders */}
            <Grid item xs={12}>
              {/* <Paper className={classes.paper}> */}
              <Paper className={classes.paper}>
                <Typography component="h2" variant="h6" color="primary" gutterBottom>
                  Huts ({huts.length})
                </Typography>
                <div style={{ display: 'flex', height: '500px' }}>
                  <div style={{ flexGrow: 1 }}>
                    <HutMap huts={huts} />
                    {/* <HutTable huts={huts} /> */}
                  </div>
                </div>
              </Paper>
            </Grid>
          </Grid>
          <Box pt={4}>
            Copyright
          </Box>
        </Container>
      </main>
    </div>
  )
}

export default App
