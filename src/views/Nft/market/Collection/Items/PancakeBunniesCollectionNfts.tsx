import React from 'react'
import styled from 'styled-components'
import orderBy from 'lodash/orderBy'
import { Collection } from 'state/nftMarket/types'
import { CollectibleLinkCard } from '../../components/CollectibleCard'
import useAllPancakeBunnyNfts from '../../hooks/useAllPancakeBunnyNfts'
import GridPlaceholder from '../../components/GridPlaceholder'

interface CollectionNftsProps {
  collection: Collection
  sortBy?: string
}

const Grid = styled.div`
  display: grid;
  align-items: start;
  grid-template-columns: 1fr, null, repeat(3, 1fr), null, repeat(4, 1fr);
  grid-gap: 16px;
`

const PancakeBunniesCollectionNfts: React.FC<CollectionNftsProps> = ({ collection, sortBy = 'updatedAt' }) => {
  const { address } = collection
  const allPancakeBunnyNfts = useAllPancakeBunnyNfts(address)

  const sortedNfts = allPancakeBunnyNfts
    ? orderBy(allPancakeBunnyNfts, (nft) => (nft.meta[sortBy] ? Number(nft?.meta[sortBy]) : 0), [
        sortBy === 'currentAskPrice' ? 'asc' : 'desc',
      ])
    : []

  if (!sortedNfts.length) {
    return <GridPlaceholder />
  }

  return (
    <>
      <Grid>
        {sortedNfts.map((nft) => {
          return <CollectibleLinkCard key={`${nft.tokenId}-${nft.collectionName}`} nft={nft} />
        })}
      </Grid>
    </>
  )
}

export default PancakeBunniesCollectionNfts
