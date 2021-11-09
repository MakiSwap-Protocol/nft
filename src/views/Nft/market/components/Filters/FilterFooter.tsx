import React from 'react'
import styled from 'styled-components';

const Grid = styled.div`
  display: grid;
`

const FilterFooter: React.FC = ({ children, ...props }) => (
  <Grid
    // gridGap="16px"
    // gridTemplateColumns="repeat(2,1fr)"
    // {...props}
    // px="24px"
    // py="16px"
    // borderTop="1px solid"
    // borderTopColor="cardBorder"
  >
    {children}
  </Grid>
)

export default FilterFooter
