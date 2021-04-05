'use strict'

const React = require('react')
const { DataGrid } = require('@material-ui/data-grid')

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
module.exports = (props) => {
  const { 
    huts
  } = props

  return (
    <DataGrid rows={huts} columns={columns} pageSize={20} checkboxSelection />
  )
}