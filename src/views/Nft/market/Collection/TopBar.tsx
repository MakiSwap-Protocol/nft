import React from 'react'
import { Box, ChevronLeftIcon, Flex } from 'maki-toolkit'
import { Link as RouterLink } from 'react-router-dom'
import styled from 'styled-components'
import { useTranslation } from 'contexts/Localization'
import SearchBar from '../components/SearchBar'

const BackLink = styled(RouterLink)`
  align-items: center;
  color: ${({ theme }) => theme.colors.primary};
  display: inline-flex;
  font-weight: 600;
`

const TopBar: React.FC = () => {
  const { t } = useTranslation()

  return (
    <Flex alignItems="center" justifyContent="space-between" mb="24px">
      <BackLink to='/collections'>
        <ChevronLeftIcon color="primary" width="24px" />
        {t('All Collections')}
      </BackLink>
      <Box>
        <SearchBar />
      </Box>
    </Flex>
  )
}

export default TopBar
