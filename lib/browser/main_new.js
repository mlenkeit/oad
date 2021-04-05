'use strict'

const React = require('react')
const ReactDOM = require('react-dom')

const {
  Autocomplete,
  Chip,
  IconButton,
  InputAdornment,
  TextField
} = require('@material-ui/core')


const Main = (props) => {
     const {
      onSomething,
      transformations
    } = props

    const compareOptions = (a, b) => 
      a && a.id
      && b && b.id
      && a.id === b.id


  // const myTransformations = [
  //   {
  //     id: 'country-de',
  //     label: 'Germany'
  //   },
  //   {
  //     id: 'country-at',
  //     label: 'Austria'
  //   },
  //   {
  //     id: 'max-elavation',
  //     label: 'Maximum Elavation',
  //     requiresValue: true,
  //     value: null,
  //     setValue: value => console.log('setting value', value)
  //   },
  //   {
  //     id: 'min-elavation',
  //     label: 'Minimum Elavation'
  //   }
  // ]
  // const [ mySelectedTransformations, setMySelectedTransformations ] = React.useState([])
  // const handleMyChange = newValue => {
  //   console.log('handleMyChange', newValue)
  //   setMySelectedTransformations(newValue)
  // }
  // const handleMySpecify = (value, option) => {
  //   console.log('handleMySpecify', value, option)
  //   setMySelectedTransformations(mySelectedTransformations.map(it => {
  //     if (it.id === option.id) {
  //       return { ...it, value, specificLabel: `Max. ${value}` }
  //     } else {
  //       return it
  //     }
  //   }))
  // }

  const [ selectedTransformations, setSelectedTransformations ] = React.useState([])
  const [ availableTransformations, setAvailableTransformations ] = React.useState(transformations)
  const [ inputMode, setInputMode ] = React.useState('search')
  const [ transformationInProcess, setTransformationInProcess ] = React.useState(null)
  
  const handleAutoChange = (evt, newValue) => {
    console.log(evt, newValue)

    const addedValues = newValue.filter(it => !selectedTransformations.find(({ id }) => it.id === id))
    console.log('addedValues', addedValues)
    const removedValues = selectedTransformations.filter(it => !newValue.find(({ id }) => it.id === id))
    console.log('removedValues', removedValues)

    if (addedValues.length === 1 && inputMode === 'value') {
      setSelectedTransformations(selectedTransformations.map(it => {
        if (it.id === transformationInProcess.id) {
          it.specificLabel = `${it.label} (${addedValues[0]})`
        }
        return it
      }))
      setTransformationInProcess(null)
      setInputMode('search')
      return
    }

    const valuesToAdd = addedValues.map(it => {
      if (it.id === 'max-elavation') {
        const cpy = { ...it }
        setTransformationInProcess(cpy)
        setInputMode('value')
        return cpy
      } else {
        return it
      }
    })
    const remainingTransformations = selectedTransformations.filter(it => !removedValues.includes(it))
    if (transformationInProcess !== null && !remainingTransformations.find(it => it.id === transformationInProcess.id)) {
      setTransformationInProcess(null)
      setInputMode('search')
    }
    setSelectedTransformations([ ...remainingTransformations, ...valuesToAdd ])

    setAvailableTransformations(transformations
      .filter(it => !newValue.find(({ id }) => it.id === id)))

    console.log('set new filtered value')
    onSomething(newValue)
  }

  // const TransformSelect = (props) => {
  //   const INPUT_MODE_SEARCH = 'search'
  //   const INPUT_MODE_SPECIFY = 'specify'

  //   const getOptionId = option => option.id
  //   const setValue = (option, value) => {
  //     if (value) option.value = value
  //     else delete option.value
  //   }

  //   const {
  //     options,
  //     value,
  //     onChange,
  //     onSpecify
  //   } = props

  //   const lastValue = value.length > 0
  //     ? value[value.length - 1]
  //     : { requiresValue: false }
    
  //   const optionBeingSpecified = lastValue.requiresValue === true && !lastValue.value
  //     ? lastValue
  //     : null
    
  //   const inputMode = lastValue.requiresValue === true && !lastValue.value
  //     ? INPUT_MODE_SPECIFY
  //     : INPUT_MODE_SEARCH

  //   console.log('inputMode', inputMode)


  //   // const [ options, setOptions ] = React.useState(options || [])
  //   // const [ inputMode, setInputMode ] = React.useState(INPUT_MODE_SEARCH)
  //   // const [ optionBeingSpecified, setOptionBeingSpecified ] = React.useState(null)

  //   const handleChange = (evt, newValue) => {
  //     console.log(evt, newValue)

  //     // const addedValues = newValue
  //     //   .filter(newValueItem => !value.find(oldValueItem => getOptionId(newValueItem) === getOptionId(oldValueItem)))
  //     // console.log('addedValues', addedValues)
  //     // const removedValues = value
  //     //   .filter(oldValueItem => !newValue.find(newValueItem => getOptionId(oldValueItem) === getOptionId(newValueItem)))
  //     // console.log('removedValues', removedValues)

  //     // if (inputMode === INPUT_MODE_SPECIFY && addedValues.length === 1) {
  //     //   const optionValue = addedValues[0]
  //     //   setValue(lastValue, optionValue)
  //     //   return onChange(newValue.filter(it => it !== optionValue))

  //     //   return onSpecify(optionValue, lastValue)

  //     //   const newValue2 = newValue
  //     //     .filter(it => it === optionValue)
  //     //     .map(it => {
  //     //       if (getOptionId(it) === getOptionId(optionBeingSpecified)) {
  //     //         return it.setValue(optionValue)
  //     //       } else {
  //     //         return it
  //     //       }
  //     //     })
  //     //   onChange(newValue2)
  //     //   return
  //     // }

  //     // let fire = true
  //     // const valuesToAdd = addedValues.map(it => {
  //     //   if (it.id === 'max-elavation') {
  //     //     // setOptionBeingSpecified({...it})
  //     //     // setInputMode(INPUT_MODE_SPECIFY)
  //     //     fire = false
  //     //     return it
  //     //   } else {
  //     //     return it
  //     //   }
  //     // })

  //     onChange(newValue, {
  //       // addedValues,
  //       // removedValues
  //     })

  //     // if ()

  //     // const remainingTransformations = selectedTransformations.filter(it => !removedValues.includes(it))
  //     // if (transformationInProcess !== null && !remainingTransformations.find(it => it.id === transformationInProcess.id)) {
  //     //   setTransformationInProcess(null)
  //     //   setInputMode('search')
  //     // }
  //     // setSelectedTransformations([ ...remainingTransformations, ...valuesToAdd ])

  //     // setAvailableTransformations(transformations
  //     //   .filter(it => !newValue.find(({ id }) => it.id === id)))

  //     console.log('set new filtered value')
  //   }

  //   return (
  //     <Autocomplete
  //       disablePortal
  //       multiple
  //       autoHighlight
  //       options={inputMode === INPUT_MODE_SEARCH 
  //         ? options//(optionBeingSpecified ? [...options, optionBeingSpecified] : options).filter(option => !value.find(selectedOption => getOptionId(option) === getOptionId(selectedOption)))
  //         : []}
  //       getOptionLabel={(option) => {
  //         if (typeof option === 'object' && option.label) {
  //           return option.label
  //         }
  //         // e.g value selected with enter, right from the input
  //         if (typeof option === 'string') {
  //           // ???
  //           return option;
  //         }
  //         if (option.inputValue) {
  //           // ???
  //           return option.inputValue;
  //         }
  //         return option.title;
  //       }}
  //       freeSolo
  //       value={value}
  //       onChange={handleChange}
  //       renderTags={(value, getTagProps) =>
  //         value.map((option, index) => (
  //           <Chip 
  //             variant='outlined' 
  //             label={option.specificLabel || option.label || option}
  //             {...getTagProps({ index })}
  //             onDelete={optionBeingSpecified && getOptionId(optionBeingSpecified) === getOptionId(option) ? null : getTagProps({ index }).onDelete} />
  //         ))
  //       }
  //       renderInput={(params) => (
  //         <TextField
  //           {...params}
  //           placeholder={inputMode === INPUT_MODE_SEARCH ? 'Search' : 'Max. Elavation'}
  //         />
  //       )}
  //     />
  //   )
  // }

  return (
    <div>
      Huts
      <br />
      <Autocomplete
        disablePortal
        multiple
        autoHighlight
        options={inputMode === 'search' ? availableTransformations : []}
        getOptionLabel={(option) => {
          if (typeof option === 'object' && option.label) {
            return option.label
          }
          // e.g value selected with enter, right from the input
          if (typeof option === 'string') {
            return option;
          }
          if (option.inputValue) {
            return option.inputValue;
          }
          return option.title;
        }}
        freeSolo
        value={selectedTransformations}
        onChange={handleAutoChange}
        renderTags={(value, getTagProps) =>
          value.map((option, index) => (
            <Chip 
              variant='outlined' 
              label={option.specificLabel || option.label || option}
              {...getTagProps({ index })}
              onDelete={transformationInProcess && transformationInProcess.id === option.id ? null : getTagProps({ index }).onDelete} />
          ))
        }
        renderInput={(params) => (
          <TextField
            {...params}
            placeholder={inputMode === 'search' ? 'Search' : 'Max. Elavation'}
          />
        )}
      />
      <br />
      separate control
      {/* <TransformSelect 
        options={myTransformations}
        value={mySelectedTransformations}
        onChange={handleMyChange}
        onSpecify={handleMySpecify}
        /> */}
    </div>
  )
}

const handleSomething = (param) => {
  console.log('something!', param)
}

const transformations = [
  {
    id: 'country-de',
    label: 'Germany2'
  },
  {
    id: 'country-at',
    label: 'Austria'
  },
  {
    id: 'max-elavation',
    label: 'Maximum Elavation',
    requiresValue: true
  },
  {
    id: 'min-elavation',
    label: 'Minimum Elavation',
    requiresValue: true
  }
  
]

ReactDOM.render(
  <Main

    transformations={transformations}
    onSomething={handleSomething} 
    />,
  document.getElementById('app')
);