import React, { ReactNode } from 'react'
import styled from 'styled-components'
import { Box, Heading } from 'maki-toolkit-v3'

const Grid = styled.div`
  display: grid;
  align-items: start;
  grid-template-columns: 1fr null, null, null, repeat(2, 1fr);
  grid-gap: 16px;
`

interface MarketPageTitleProps {
  title: string
  description?: ReactNode
}

const MarketPageTitle: React.FC<MarketPageTitleProps> = ({ title, description, children, ...props }) => (
  <Grid>
    <Box>
      <Heading as="h1" scale="xl" color="secondary" mb="16px">
        {title}
      </Heading>
      {description}
    </Box>
    <Box>{children}</Box>
  </Grid>
)

export default MarketPageTitle
