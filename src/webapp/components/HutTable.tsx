// import React from 'react'
import { DataGrid } from '@material-ui/data-grid'

const columns = [
  { field: 'id', headerName: 'ID', width: 70 },
  { field: 'name', headerName: 'Hut', width: 200 },
  { 
    field: 'flag', 
    headerName: 'Country', 
    width: 70,
    sortable: false,
    valueGetter: (params: any) => {
      const countryCode = params.row.countryCode.toLowerCase()
      if (countryCode === 'de') return '🇩🇪'
      if (countryCode === 'ch') return '🇨🇭'
      if (countryCode === 'at') return '🇦🇹'
      if (countryCode === 'si') return '🇸🇰'
      return 'n/a'
    }
  }
]
const HutTable = (props: any) => {
  const { 
    huts
  } = props

  return (
    <DataGrid rows={huts} columns={columns} pageSize={20} checkboxSelection />
  )
}

export default HutTable