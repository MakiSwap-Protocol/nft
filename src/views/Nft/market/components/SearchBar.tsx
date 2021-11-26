import React from 'react'
import { useHistory } from 'react-router-dom'
// import AddressInputSelect from 'components/AddressInputSelect'

const SearchBar: React.FC = (props) => {
  const history = useHistory()

  const handleAddressClick = (value: string) => {
    history.push(`/profile/${value}`)
  }

  // return <AddressInputSelect onAddressClick={handleAddressClick} {...props} />
  return <div />
}

export default SearchBar
