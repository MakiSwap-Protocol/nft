import React, { useEffect, useState } from 'react'
import { useWeb3React } from '@web3-react/core'
import { uniqBy } from 'lodash'
import { isAddress } from 'utils'
import { fetchUserActivity } from 'state/nftMarket/reducer'
import { useAppDispatch } from 'state'
import { useUserNfts } from 'state/nftMarket/hooks'
import { ArrowBackIcon, ArrowForwardIcon, Card, Flex, Text, useMatchBreakpoints } from 'maki-toolkit-v3'
import { getNftsFromDifferentCollectionsApi, getUserActivity } from 'state/nftMarket/helpers'
import { NftToken, TokenIdWithCollectionAddress, UserNftInitializationState } from 'state/nftMarket/types'
import { useTranslation } from 'contexts/Localization'
// import { useBNBBusdPrice } from 'hooks/useBUSDPrice'
import useTheme from 'hooks/useTheme'
import { useParams } from 'react-router'
import { Activity, sortUserActivity } from '../../utils/sortUserActivity'
import ActivityRow from './ActivityRow'
import TableLoader from './TableLoader'
import NoNftsImage from '../NoNftsImage'
import { Arrow, PageButtons } from '../../../components/PaginationButtons'

const MAX_PER_PAGE = 8

const ActivityHistory = () => {
  const { account } = useWeb3React()
  const dispatch = useAppDispatch()
  const { accountAddress } = useParams<{ accountAddress: string }>()
  const { theme } = useTheme()
  const { t } = useTranslation()
  const [currentPage, setCurrentPage] = useState(1)
  const [maxPage, setMaxPages] = useState(1)
  const [activitiesSlice, setActivitiesSlice] = useState<Activity[]>([])
  const [nftMetadata, setNftMetadata] = useState<NftToken[]>([])
  const [sortedUserActivities, setSortedUserActivities] = useState<Activity[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { activity: userActivity } = useUserNfts()
  // const bnbBusdPrice = useBNBBusdPrice()
  const { isXs, isSm } = useMatchBreakpoints()

  useEffect(() => {
    if (account && userActivity.initializationState === UserNftInitializationState.INITIALIZED) {
      const differentAddress =
        accountAddress && isAddress(accountAddress)
          ? account.toLowerCase() !== accountAddress.toLocaleLowerCase()
          : false
      if (!differentAddress) {
        setSortedUserActivities(sortUserActivity(account, userActivity))
        setIsLoading(false)
      }
    }
  }, [account, userActivity, accountAddress])

  useEffect(() => {
    const fetchAddressActivity = async () => {
      try {
        const addressActivity = await getUserActivity(accountAddress.toLocaleLowerCase())
        setSortedUserActivities(sortUserActivity(accountAddress, addressActivity))
        setIsLoading(false)
      } catch (error) {
        console.error('Failed to fetch address activity', error)
      }
    }

    if (account) {
      const differentAddress =
        accountAddress && isAddress(accountAddress)
          ? account.toLowerCase() !== accountAddress.toLocaleLowerCase()
          : false
      if (differentAddress) {
        fetchAddressActivity()
      } else {
        dispatch(fetchUserActivity(account))
      }
    } else if (accountAddress && isAddress(accountAddress)) {
      fetchAddressActivity()
    }
  }, [account, accountAddress, dispatch])

  useEffect(() => {
    const fetchActivityNftMetadata = async () => {
      const activityNftTokenIds = uniqBy(
        sortedUserActivities.map((activity): TokenIdWithCollectionAddress => {
          return { tokenId: activity.nft.tokenId, collectionAddress: activity.nft.collection.id }
        }),
        'tokenId',
      )
      const nfts = await getNftsFromDifferentCollectionsApi(activityNftTokenIds)
      setNftMetadata(nfts)
    }

    const getMaxPages = () => {
      const max = Math.ceil(sortedUserActivities.length / MAX_PER_PAGE)
      setMaxPages(max)
    }

    if (sortedUserActivities.length > 0) {
      getMaxPages()
      fetchActivityNftMetadata()
    }

    return () => {
      setActivitiesSlice([])
      setNftMetadata([])
      setMaxPages(1)
      setCurrentPage(1)
    }
  }, [sortedUserActivities])

  useEffect(() => {
    const getActivitiesSlice = () => {
      const slice = sortedUserActivities.slice(MAX_PER_PAGE * (currentPage - 1), MAX_PER_PAGE * currentPage)
      setActivitiesSlice(slice)
    }
    if (sortedUserActivities.length > 0) {
      getActivitiesSlice()
    }
  }, [sortedUserActivities, currentPage])

  return (
    <Card>
      {sortedUserActivities.length === 0 && nftMetadata.length === 0 && activitiesSlice.length === 0 && !isLoading ? (
        <Flex p="24px" flexDirection="column" alignItems="center">
          <NoNftsImage />
          <Text pt="8px" bold>
            {t('No NFT market history found')}
          </Text>
        </Flex>
      ) : (
        <>
          <table>
            <thead>
              <tr>
                <th style={{ textAlign: 'center' }}> {t('Item')}</th>
                <th style={{ textAlign: 'right' }}> {t('Event')}</th>
                {isXs || isSm ? null : (
                  <>
                    <th style={{ textAlign: 'right' }}> {t('Price')}</th>
                    <th style={{ textAlign: 'right' }}> {t('From/To')}</th>
                  </>
                )}
                <th style={{ textAlign: 'center' }}> {t('Date')}</th>
                {/* {isXs || isSm ? null : <th />} */}
              </tr>
            </thead>

            <tbody>
              {isLoading ? (
                <TableLoader />
              ) : (
                activitiesSlice.map((activity) => {
                  const nftMeta = nftMetadata.find((metaNft) => metaNft.tokenId === activity.nft.tokenId)
                  return (
                    <div />
                    // <ActivityRow
                    //   key={`${activity.nft.tokenId}${activity.timestamp}`}
                    //   activity={activity}
                    //   nft={nftMeta}
                    //   bnbBusdPrice={bnbBusdPrice}
                    // />
                  )
                })
              )}
            </tbody>
          </table>
          <Flex
            borderTop={`1px ${theme.colors.cardBorder} solid`}
            pt="24px"
            flexDirection="column"
            justifyContent="space-between"
            height="100%"
          >
            <PageButtons>
              <Arrow
                onClick={() => {
                  setCurrentPage(currentPage === 1 ? currentPage : currentPage - 1)
                }}
              >
                <ArrowBackIcon color={currentPage === 1 ? 'textDisabled' : 'primary'} />
              </Arrow>
              <Text>{t('Page %page% of %maxPage%', { page: currentPage, maxPage })}</Text>
              <Arrow
                onClick={() => {
                  setCurrentPage(currentPage === maxPage ? currentPage : currentPage + 1)
                }}
              >
                <ArrowForwardIcon color={currentPage === maxPage ? 'textDisabled' : 'primary'} />
              </Arrow>
            </PageButtons>
          </Flex>
        </>
      )}
    </Card>
  )
}

export default ActivityHistory
