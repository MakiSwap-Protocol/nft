import React from 'react'
import styled from 'styled-components'
import { Box, BoxProps, Skeleton } from 'maki-toolkit-v3'
import times from 'lodash/times'

const Grid = styled.div`
  display: grid;
  grid-gap: 16px;
  grid-template-columns: 1fr, null, null, repeat(4, 1fr)
`

export const GridPlaceholderItem: React.FC<BoxProps> = (props) => (
  <Box {...props}>
    <Skeleton height="258px" mb="8px" />
    <Skeleton width="30%" mb="4px" />
    <Skeleton width="45%" mb="16px" />
    <Skeleton />
  </Box>
)

const GridPlaceholder: React.FC<{ numItems?: number }> = ({ numItems = 12 }) => (
  <Grid>
    {times(numItems).map((itemKey) => (
      <GridPlaceholderItem key={itemKey} />
    ))}
  </Grid>
)

export default GridPlaceholder
