import React from 'react'
import styled from 'styled-components'
import { Button, ChevronRightIcon, Flex, Heading, Text } from 'maki-toolkit-v3'
import { Link } from 'react-router-dom'
import { Collection } from 'state/nftMarket/types'
import { useTranslation } from 'contexts/Localization'
import { HotCollectionCard } from '../components/CollectibleCard'
import { BNBAmountLabel } from '../components/CollectibleCard/styles'

const Grid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: repeat(4, auto);
  grid-gap: 16px;
  margin-bottom: 64px;
  ${({ theme }) => theme.mediaQueries.xs} {
    grid-template-columns: 1fr;
  }

  ${({ theme }) => theme.mediaQueries.sm} {
    grid-template-columns: repeat(2, 1fr);
  }

  ${({ theme }) => theme.mediaQueries.md} {
    grid-template-columns: repeat(3, 1fr);
  }
`

const Collections: React.FC<{ title: string; testId: string; collections: Collection[] }> = ({
  title,
  testId,
  collections,
}) => {
  const { t } = useTranslation()

  return (
    <>
      <Flex alignItems="center" justifyContent="space-between" mb="32px">
        <Heading as="h3" scale="lg" data-test={testId}>
          {title}
        </Heading>
        <Button
          as={Link}
          to="/collections/"
          variant="secondary"
          scale="sm"
          endIcon={<ChevronRightIcon color="primary" width="24px" />}
        >
          {t('View All')}
        </Button>
      </Flex>
      <Grid>
        {collections.slice(0, 6).map((collection) => {
          return (
            <HotCollectionCard
              key={collection.address}
              bgSrc={collection.banner.small}
              avatarSrc={collection.avatar}
              collectionName={collection.name}
              url={`/collections/${collection.address}`}
            >
              <Flex alignItems="center">
                <Text fontSize="12px" color="textSubtle">
                  {t('Volume')}
                </Text>
                <BNBAmountLabel amount={collection.totalVolumeBNB ? parseFloat(collection.totalVolumeBNB) : 0} />
              </Flex>
            </HotCollectionCard>
          )
        })}
      </Grid>
    </>
  )
}

export default Collections
