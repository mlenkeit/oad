// import React from 'react'
// import { DataGrid } from '@material-ui/data-grid'

import List from '@material-ui/core/List';
// import Avatar from '@material-ui/core/Avatar';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
// import ListItemAvatar from '@material-ui/core/ListItemAvatar';
// import ListItemIcon from '@material-ui/core/ListItemIcon';

// const columns = [
//   { field: 'id', headerName: 'ID', width: 70 },
//   { field: 'name', headerName: 'Hut', width: 200 },
//   { 
//     field: 'flag', 
//     headerName: 'Country', 
//     width: 70,
//     sortable: false,
//     valueGetter: (params: any) => {
//       const countryCode = params.row.countryCode.toLowerCase()
//       if (countryCode === 'de') return '🇩🇪'
//       if (countryCode === 'ch') return '🇨🇭'
//       if (countryCode === 'at') return '🇦🇹'
//       if (countryCode === 'si') return '🇸🇰'
//       return 'n/a'
//     }
//   }
// ]

const country = (hut: any) => {
  const countryCode = hut.countryCode.toLowerCase()
  if (countryCode === 'de') return '🇩🇪'
  if (countryCode === 'ch') return '🇨🇭'
  if (countryCode === 'at') return '🇦🇹'
  if (countryCode === 'si') return '🇸🇰'
  return 'n/a'
}

const HutList = (props: any) => {
  const { 
    huts
  } = props
  console.log('HutList got', huts.length, huts[0])

  return (
    <List>
      <div>
      {huts.map((hut: any) =>
      <ListItem divider={true}>
        <ListItemText primary={hut.name} secondary={`${country(hut)} ${hut.elevation} m`} />
      </ListItem>
      )}
      </div>
    </List>
  )
}

export default HutList