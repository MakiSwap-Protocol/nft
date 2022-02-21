import React from 'react'
import { Link } from 'react-router-dom'
import styled from 'styled-components'
import { StyledCollectibleCard } from './styles'
import CardBody from './CardBody'
import { CollectibleCardProps } from './types'
import { pancakeBunniesAddress } from '../../constants'

const InnerStyledCollectibleCard = styled.div`
  width: calc(100% - 1px);
  height: calc(100% - 3px);
  margin-top: 1px;
  overflow: inherit;
  background: #FFFFFF;
  border-radius: 24px;
`

const CollectibleLinkCard: React.FC<CollectibleCardProps> = ({ nft, nftLocation, currentAskPrice, ...props }) => {
  const urlId =
    nft.collectionAddress.toLowerCase() === pancakeBunniesAddress.toLowerCase() ? nft.attributes[0].value : nft.tokenId
  return (
    <StyledCollectibleCard {...props}>
      <InnerStyledCollectibleCard>
        <Link to={`/collections/${nft.collectionAddress}/${urlId}`}>
          <CardBody nft={nft} nftLocation={nftLocation} currentAskPrice={currentAskPrice} />
        </Link>
      </InnerStyledCollectibleCard>
    </StyledCollectibleCard>
  )
}

export default CollectibleLinkCard
