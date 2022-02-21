import React, { useState, useEffect } from 'react'
import styled from 'styled-components'
import { Heading, Flex, Button, ChevronRightIcon } from 'maki-toolkit-v3'
import { useTranslation } from 'contexts/Localization'
import { Link } from 'react-router-dom'
import { NftToken } from 'state/nftMarket/types'
import { getLatestListedNfts, getNftsFromDifferentCollectionsApi } from 'state/nftMarket/helpers'
import { pancakeBunniesAddress } from 'views/Nft/market/constants'
import { CollectibleLinkCard } from '../components/CollectibleCard'
import GridPlaceholder from '../components/GridPlaceholder'

const Grid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: repeat(4, auto);
  grid-row-gap: 24px;
  grid-column-gap: 16px;

  ${({ theme }) => theme.mediaQueries.xs} {
    grid-template-columns: repeat(2, 1fr);
  }

  ${({ theme }) => theme.mediaQueries.sm} {
    grid-template-columns: repeat(2, 1fr);
  }

  ${({ theme }) => theme.mediaQueries.md} {
    grid-template-columns: repeat(4, 1fr);
  }
`

/**
 * Fetch latest NFTs data from SG+API and combine them
 * @returns Array of NftToken
 */
const useNewestNfts = () => {
  const [newestNfts, setNewestNfts] = useState<NftToken[]>(null)

  useEffect(() => {
    const fetchNewestNfts = async () => {
      const nftsFromSg = await getLatestListedNfts(16)
      const nftsFromApi = await getNftsFromDifferentCollectionsApi(
        nftsFromSg.map((nft) => ({ collectionAddress: nft.collection.id, tokenId: nft.tokenId })),
      )

      const nfts = nftsFromSg.map((nftFromSg, index) => {
        const nftFromApi = nftsFromApi[index]
        return { ...nftFromApi, marketData: nftFromSg }
      })
      setNewestNfts(nfts)
    }
    fetchNewestNfts()
  }, [])

  return newestNfts
}

const Newest: React.FC = () => {
  const { t } = useTranslation()
  const nfts = useNewestNfts()

  return (
    <div>
      <Flex justifyContent="space-between" alignItems="center" mb="26px">
        <Heading>{t('Newest Arrivals')}</Heading>
        <Button
          as={Link}
          to='/collections'
          variant="secondary"
          scale="sm"
          endIcon={<ChevronRightIcon color="primary" />}
        >
          {t('View All')}
        </Button>
      </Flex>
      {nfts ? (
        <Grid>
          {nfts.map((nft) => {
            const isPBCollection = nft.collectionAddress.toLowerCase() === pancakeBunniesAddress.toLowerCase()
            const currentAskPrice =
              !isPBCollection && nft.marketData?.isTradable ? parseFloat(nft.marketData.currentAskPrice) : undefined
            return (
              <CollectibleLinkCard
                data-test="newest-nft-card"
                key={nft.collectionAddress + nft.tokenId}
                nft={nft}
                currentAskPrice={currentAskPrice}
              />
            )
          })}
        </Grid>
      ) : (
        <GridPlaceholder numItems={8} />
      )}
    </div>
  )
}

export default Newest
