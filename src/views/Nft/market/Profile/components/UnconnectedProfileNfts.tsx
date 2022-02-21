import React from 'react'
import styled from 'styled-components'
import { Text, Flex } from 'maki-toolkit-v3'
import { NftToken } from 'state/nftMarket/types'
import { useTranslation } from 'contexts/Localization'
import { CollectibleLinkCard } from '../../components/CollectibleCard'
import GridPlaceholder from '../../components/GridPlaceholder'
import NoNftsImage from './NoNftsImage'

const Grid = styled.div`
  display: grid;
  align-items: start;
  grid-template-columns: 1fr repeat(2, 1fr) repeat(3, 1fr) null repeat(4, 1fr);
  grid-gap: 16px;
`

const UserNfts: React.FC<{ nfts: NftToken[]; isLoading: boolean }> = ({ nfts, isLoading }) => {
  const { t } = useTranslation()

  return (
    <>
      {/* User has no NFTs */}
      {nfts.length === 0 && !isLoading ? (
        <Flex p="24px" flexDirection="column" alignItems="center">
          <NoNftsImage />
          <Text pt="8px" bold>
            {t('No NFTs found')}
          </Text>
        </Flex>
      ) : // User has NFTs and data has been fetched
      nfts.length > 0 ? (
        <Grid
          // gridGap="16px"
          // gridTemplateColumns={['1fr', 'repeat(2, 1fr)', 'repeat(3, 1fr)', null, 'repeat(4, 1fr)']}
          // alignItems="start"
        >
          {nfts.map((nft) => {
            const { marketData } = nft

            return (
              <CollectibleLinkCard
                key={`${nft.tokenId}-${nft.collectionName}`}
                nft={nft}
                currentAskPrice={
                  marketData?.currentAskPrice && marketData?.isTradable && parseFloat(marketData.currentAskPrice)
                }
              />
            )
          })}
        </Grid>
      ) : (
        // User NFT data hasn't been fetched
        <GridPlaceholder />
      )}
    </>
  )
}

export default UserNfts
