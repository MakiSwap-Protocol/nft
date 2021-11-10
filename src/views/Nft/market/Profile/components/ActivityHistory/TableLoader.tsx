import React from 'react'
import styled from 'styled-components'
import { Flex, Skeleton, useMatchBreakpoints } from 'maki-toolkit'

const GridItem = styled(Flex)`
  align-items: center;
`

const LoadingRow: React.FC = () => {
  const { isXs, isSm } = useMatchBreakpoints()

  return (
    <tr>
      <td>
        <GridItem>
          <Skeleton height={[162, null, 64]} width={[80, null, 200]} />
        </GridItem>
      </td>
      <td>
        <GridItem justifyContent="flex-end">
          <Skeleton height={[66, null, 24]} width={64} />
        </GridItem>
      </td>
      {isXs || isSm ? null : (
        <>
          <td>
            <GridItem justifyContent="flex-end">
              <Skeleton height={42} width={64} />
            </GridItem>
          </td>
          <td>
            <GridItem justifyContent="flex-end">
              <Skeleton height={48} width={124} />
            </GridItem>
          </td>
        </>
      )}
      <td>
        <GridItem justifyContent="center">
          <Skeleton height={[36, null, 24]} width={[80, null, 120]} />
        </GridItem>
      </td>
    </tr>
  )
}

const TableLoader: React.FC = () => (
  <>
    <LoadingRow />
    <LoadingRow />
    <LoadingRow />
    <LoadingRow />
    <LoadingRow />
    <LoadingRow />
    <LoadingRow />
    <LoadingRow />
  </>
)

export default TableLoader
