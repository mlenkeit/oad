// import logo from './logo.svg';
import './App.css';

import React, { useState, useEffect } from 'react'
import clsx from 'clsx'
import { makeStyles, useTheme } from '@material-ui/core/styles'
import CssBaseline from '@material-ui/core/CssBaseline';
import Drawer from '@material-ui/core/Drawer';
import Box from '@material-ui/core/Box';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import List from '@material-ui/core/List';
import Typography from '@material-ui/core/Typography';
// import Divider from '@material-ui/core/Divider';
import IconButton from '@material-ui/core/IconButton';
// import Badge from '@material-ui/core/Badge';
import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';
// import Paper from '@material-ui/core/Paper';
// import Link from '@material-ui/core/Link';
// import Icon from '@material-ui/core/Icon';
import MenuIcon from '@material-ui/icons/Menu';
// import RestoreIcon from '@material-ui/icons/Restore';
// import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
// import NotificationsIcon from '@material-ui/icons/Notifications';
import FilterListIcon from '@material-ui/icons/FilterList';
import MapIcon from '@material-ui/icons/Map';
import ListIcon from '@material-ui/icons/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
// import ListItemIcon from '@material-ui/core/ListItemIcon';
import FormControl from '@material-ui/core/FormControl';
import FormLabel from '@material-ui/core/FormLabel';
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import TextField from '@material-ui/core/TextField';
import InputAdornment from '@material-ui/core/InputAdornment';
// import Modal from '@material-ui/core/Modal';
// import Fade from '@material-ui/core/Fade';
import useMediaQuery from '@material-ui/core/useMediaQuery';
// import TabbedHutList from './components/TabbedHutList'
import HutMap from './components/HutMap'
import moment from 'moment'
// import BottomNavigation from '@material-ui/core/BottomNavigation';
// import BottomNavigationAction from '@material-ui/core/BottomNavigationAction';

import MomentUtils from '@date-io/moment';
import {
  MuiPickersUtilsProvider, KeyboardDatePicker
} from '@material-ui/pickers'


// import HutMap from './components/HutMap'
// import HutTable from './components/HutTable'
import hutRepoFactory, { /*HutQueryBuilder, HutWithDistance,*/ Hut, transformHutArray, transformations as hutTx } from './../common/repo/hut-repo'
import reservationRepoFactory, { transformations as reservationTx } from './../common/repo/reservation-repo'

// FA
import { library } from '@fortawesome/fontawesome-svg-core'
import { fas } from '@fortawesome/free-solid-svg-icons'
// import { far } from '@fortawesome/free-regular-svg-icons'
// import {
//   IconLookup,
//   // IconDefinition,
//   // findIconDefinition
// } from '@fortawesome/fontawesome-svg-core'
// import {
//   FontAwesomeIcon
// } from '@fortawesome/react-fontawesome'

library.add(fas)
// const coffeeLookup: IconLookup = { prefix: 'fas', iconName: 'house' }
// const coffeeIconDefinition: IconDefinition = findIconDefinition(coffeeLookup)

const hutRepo = hutRepoFactory()
const reservationRepo = reservationRepoFactory()

const drawerWidth = 240
const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    flexDirection: 'row-reverse',
    height: '100vh',
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
  // appBarShift: {
  //   marginLeft: drawerWidth,
  //   width: `calc(100% - ${drawerWidth}px)`,
  //   transition: theme.transitions.create(['width', 'margin'], {
  //     easing: theme.transitions.easing.sharp,
  //     duration: theme.transitions.duration.enteringScreen,
  //   }),
  // },
  menuButton: {
    marginRight: theme.spacing(1),
    // [theme.breakpoints.up('sm')]: {
    //   display: 'none'
    // }
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
    [theme.breakpoints.down('sm')]: {
      overflowX: 'hidden',
      width: 0
    }
  },
  drawerPaperClose: {
    [theme.breakpoints.down('sm')]: {
      overflowX: 'hidden',
      width: '70vw',
      transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
      })
    }
  },
  appBarSpacer: {
    ...theme.mixins.toolbar,
    flex: '0 1 56px'
  },
  content: {
    flexGrow: 1,
    display: 'flex',
    flexDirection: 'column',
    // height: '100vh',
    overflow: 'auto',
  },
  container: {
    flex: '1 1 auto',
    overflow: 'auto',
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(4),
    display: 'flex',
    flexDirection: 'column',
    flexGrow: 1,
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
  footer: {
    marginTop: 'auto',
  },
  filterContainer: {
    height: '100vh',
    display: 'flex',
    alignItems: 'center'
  },
  filterPaper: {
    height: '95%',
    width: '100%'
  },
  filterDrawer: {
    [theme.breakpoints.up('sm')]: {
      transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.enteringScreen,
      }),
      width: '300px',
      flexShrink: 0,
    }
  },
  filterDrawerClose: {
    [theme.breakpoints.up('sm')]: {
      transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
      }),
      width: 0
    }
  },
  filterDrawerPaper: {
    [theme.breakpoints.down('sm')]: {
      width: '85%'
    },
    [theme.breakpoints.up('sm')]: {
      transition: theme.transitions.create('right', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.enteringScreen,
      }),
      width: '300px'
    }
  },
  filterDrawerPaperClose: {
    [theme.breakpoints.up('sm')]: {
      transition: theme.transitions.create('right', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
      }),
      overflowX: 'hidden',
      right: '-300px'
    }
  }
}))

const country = (hut: any) => {
  const countryCode = hut.countryCode.toLowerCase()
  if (countryCode === 'de') return '????????'
  if (countryCode === 'ch') return '????????'
  if (countryCode === 'at') return '????????'
  if (countryCode === 'si') return '????????'
  return 'n/a'
}

type HutDisplayMode = 'list' | 'map'

function App() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  // const matchesMediaQuery = useMediaQuery(theme.breakpoints.down('sm'));
  // console.log('matchesMediaQuery', matchesMediaQuery)
  const classes = useStyles()
  const [ hutDisplayMode, setHutDisplayMode ] = useState<HutDisplayMode>('list')
  const [open, setOpen] = React.useState(true)
  const handleDrawerOpen = () => {
    console.log('setting open to', !open)
    setOpen(!open);
  };
  // const handleDrawerClose = () => {
  //   setOpen(false);
  // };
  // const fixedHeightPaper = clsx(classes.paper, classes.fixedHeight);

  const [ huts, setHuts ] = useState<Hut[]>([])
  const [ hutsUpdatedAt, setHutsUpdatedAt ] = useState(moment())

  const [ countryCodeFilters, setCountryCodeFilters ] = useState([
    { label: '???????? DE', tx: hutTx.filterByCountryCode, value: 'DE', active: false }, 
    { label: '???????? CH', tx: hutTx.filterByCountryCode, value: 'CH', active: false }, 
    { label: '???????? AT', tx: hutTx.filterByCountryCode, value: 'AT', active: false }, 
  ])

  const [ elevationFilters, setElevationFilters ] = useState([
    { label: 'Min. elevation', tx: hutTx.filterByMinElevation, value: null, active: false },
    { label: 'Max. elevation', tx: hutTx.filterByMaxElevation, value: null, active: false }
  ])

  const [ reservationDateFilter, setReservationDateFilter ] = useState(
    { label: 'Reservation Date', tx: reservationTx.filterByDateRange, value: null, active: false }
  )
  const [ freeRoomFilter, setFreeRoomFilter ] = useState(
    { label: 'Number of people', tx: reservationTx.filterByMinFreeRoom, value: null, active: false }
  )

  // const [ transformations, setTransformations ] = useState([
  //   { label: '???????? DE', group: 'countryCode', active: false, tx: hutTx.filterByCountryCode('DE'), value: 'DE' },
  //   { label: '???????? CH', group: 'countryCode', active: false, tx: hutTx.filterByCountryCode('CH'), value: 'CH' },
  //   { label: '???????? AT', group: 'countryCode', active: false, tx: hutTx.filterByCountryCode('AT'), value: 'AT' },
  //   { label: 'Min. Elevation', tx: hutTx.noop(), txFromInput: hutTx.filterByMinElevation, group: 'elevation', combinable: true, active: false, value: null },
  //   { label: 'Max. Elevation', tx: hutTx.noop(), txFromInput: hutTx.filterByMaxElevation, group: 'elevation', combinable: true, active: false, value: null },
  //   { label: 'Reservation Date', tx: hutTx.noop(), txFromInput: hutTx.filterByMaxElevation, group: 'availability', active: false, value: null },
  //   { label: 'Free Room', tx: hutTx.noop(), txFromInput: hutTx.filterByMaxElevation, group: 'availability', active: false, value: null },
  // ])
  
  useEffect(() => {
    const fetchHuts = async () => {
      setHutsUpdatedAt(hutRepo.getUpdatedAt())
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
        ...(reservationDateFilter.value !== null && freeRoomFilter.value !== null
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
        if (it.label === item.label) {
          it.active = !it.active
        }
        return it
      }))
    }
  }

  const updateElevation = (item: any) => {
    return (evt: any) => {
      const value = evt.target.value
      if (!!value) {
        setElevationFilters(elevationFilters.map(it => {
          if (it.label === item.label) {
            // @ts-ignore
            it.value = parseInt(value)
            it.active = true
          }
          return it
        }))
      } else {
        setElevationFilters(elevationFilters.map(it => {
          if (it.label === item.label) {
            item.value = null
            it.active = false
          }
          return it
        }))
      }
    }
  }
  const updateFreeRoom = (item: any) => {
    return (evt: any) => {
      const value = evt.target.value
      if (!!value) item.value = parseInt(value)
      else item.value = null
      setFreeRoomFilter({ ...item })
    }
  }

  const handleOpen = (item: any) => {
    return (openAt: any) => {
      item.value = openAt
      setReservationDateFilter({ ...item })
    }
  }

  const changeHutDisplayMode = (targetMode: HutDisplayMode) => {
    return () => setHutDisplayMode(targetMode)
  }

  const mainRef: any = React.createRef()
  const [ showSubtitle, setShowSubtitle ] = useState(false) 
  const onMainScroll = () => {
    if (mainRef.current.scrollTop > 60 && !showSubtitle) {
      setShowSubtitle(true)
    } else if (mainRef.current.scrollTop <= 60 && showSubtitle) {
      setShowSubtitle(false)
    }
  }

  const [ showFilters, setShowFilters ] = useState(false)
  const handleFilterButtonClick = () => {
    setShowFilters(!showFilters)
  }
  const handleFilterDrawerClose = () => {
    setShowFilters(false)
  }

  return (
    <div className={classes.root}>
      <CssBaseline />
      {/* <Modal open={false}>
        <Fade in={showFilters}>
          <Container maxWidth="md" className={classes.filterContainer}>
            <Paper className={clsx(classes.paper, classes.filterPaper)}>
              
            </Paper>
          </Container>
        </Fade>
      </Modal> */}
      <AppBar position="absolute" className={classes.appBar}>
        <Toolbar className={classes.toolbar}>
          <IconButton
            edge="start"
            color="inherit"
            aria-label="open drawer"
            onClick={handleDrawerOpen}
            // className={clsx(classes.menuButton, open && classes.menuButtonHidden)}
            className={classes.menuButton}
          >
            <MenuIcon />
          </IconButton>
          <Typography component="h1" variant="h6" color="inherit" noWrap className={classes.title}>
            Open Alpine Data {showSubtitle ? `- Huts (${huts.length})` : ''}
          </Typography>
          <IconButton onClick={handleFilterButtonClick} color="inherit">
            <FilterListIcon />
          </IconButton>
          {hutDisplayMode === 'list'
            ? <IconButton onClick={changeHutDisplayMode('map')} color="inherit">
                <MapIcon />
              </IconButton>
            : <IconButton onClick={changeHutDisplayMode('list')} color="inherit">
                <ListIcon />
              </IconButton>
          }
        </Toolbar>
      </AppBar>
      <Drawer 
        open={showFilters} 
        onClose={handleFilterDrawerClose} 
        anchor="right"
        variant={isMobile ? 'temporary' : 'permanent'}
        className={clsx(classes.filterDrawer, !showFilters && classes.filterDrawerClose)}
        classes={{
          paper: clsx(classes.paper, classes.filterDrawerPaper, !showFilters && classes.filterDrawerPaperClose),
        }}
      >
        <div className={!isMobile ? classes.appBarSpacer : ''} />
        <Typography component="h2" variant="h6" color="primary" gutterBottom>
          Filter
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <FormControl component="fieldset">
              <FormLabel component="legend">Countries</FormLabel>
              <FormGroup>
              {countryCodeFilters.map(it =>
                <FormControlLabel
                  control={<Checkbox checked={it.active} name={it.label} onChange={toggleCountryCode(it)} />}
                  key={it.label}
                  label={it.label}
                />
              )}
              </FormGroup>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <FormControl component="fieldset">
              <FormLabel component="legend">Elevation</FormLabel>
              <FormGroup>
              {elevationFilters.map(it =>
                <TextField
                  key={it.label}
                  label={it.label}
                  onChange={updateElevation(it)}
                  value={it.value ? it.value : ''}
                  InputProps={{
                    endAdornment: <InputAdornment position="end">m</InputAdornment>,
                  }}
                />
                )}
              </FormGroup>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
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
                id={freeRoomFilter.label}
                label={freeRoomFilter.label}
                value={freeRoomFilter.value ? freeRoomFilter.value : ''}
                onChange={updateFreeRoom(freeRoomFilter)} />
              </FormGroup>
            </FormControl>
          </Grid>
        </Grid>
      </Drawer>
      <main className={classes.content} onScroll={onMainScroll} ref={mainRef}>
        <div className={classes.appBarSpacer} />
        <Container maxWidth={hutDisplayMode === 'list' ? 'md' : 'xl'} className={classes.container}>
          <Typography component="h2" variant="h5" color="primary" gutterBottom>
            Huts ({huts.length})
          </Typography>
          {hutDisplayMode === 'list'
            ? <List>
                <div>
                {huts.map((hut: any) =>
                <ListItem key={hut.id} divider={true}>
                  <ListItemText primary={hut.name} secondary={`${country(hut)} ${hut.elevation} m`} />
                  {/* <ListItemText>Hello List ITem</ListItemText>
                  <ListItemText>Hello List ITem</ListItemText> */}
                </ListItem>
                )}
                </div>
              </List>
            : <div style={{ display: 'flex', flex: '1 1 auto' }}>
                <div style={{ flexGrow: 1 }}>
                  <HutMap huts={huts} />
                </div>
              </div>
          }
          <Box pt={4}>
            Data last updated <time dateTime={hutsUpdatedAt.toISOString()} title={hutsUpdatedAt.format()}>{hutsUpdatedAt.fromNow()}</time>
          </Box>
        </Container>
      </main>
    </div>
  )
}

export default App
