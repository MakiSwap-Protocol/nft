import React from 'react'
import { Image, Flex, Text, IconButton, Link, OpenNewIcon, useMatchBreakpoints, useModal } from 'maki-toolkit'
import { NftToken } from 'state/nftMarket/types'
import { Price } from 'maki-sdk'
import styled from 'styled-components'
import { getEtherscanLink } from 'utils'
import { useActiveWeb3React } from 'hooks'
import ProfileCell from 'views/Nft/market/components/ProfileCell'
import { Activity } from '../../utils/sortUserActivity'
import ActivityEventText from './ActivityEventText'
import ActivityPrice from './ActivityPrice'
import MobileModal from './MobileModal'

const RoundedImage = styled(Image)`
  & > img {
    border-radius: ${({ theme }) => theme.radii.default};
  }
`

interface ActivityRowProps {
  activity: Activity
  nft: NftToken
  bnbBusdPrice: Price
}

const ActivityRow: React.FC<ActivityRowProps> = ({ activity, bnbBusdPrice, nft }) => {
  const { chainId } = useActiveWeb3React()
  const { isXs, isSm } = useMatchBreakpoints()
  const priceAsFloat = parseFloat(activity.price)
  const timestampAsMs = parseFloat(activity.timestamp) * 1000
  const localeTimestamp = new Date(timestampAsMs).toLocaleString(undefined, {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
  })
  const [onPresentMobileModal] = useModal(
    <MobileModal nft={nft} activity={activity} localeTimestamp={localeTimestamp} bnbBusdPrice={bnbBusdPrice} />,
  )

  return (
    <tr {...((isXs || isSm) && { onClick: onPresentMobileModal })}>
      <td>
        <Flex justifyContent="flex-start" alignItems="center" flexDirection={['column', null, 'row']}>
          <RoundedImage
            src={nft?.image.thumbnail}
            alt={nft?.name}
            width={64}
            height={64}
            mr={[0, null, '16px']}
            mb={['8px', null, 0]}
          />
          <Flex flexDirection="column">
            <Text textAlign={['center', null, 'left']} color="textSubtle" fontSize="14px">
              {nft?.collectionName}
            </Text>
            <Text textAlign={['center', null, 'left']} bold>
              {nft?.name}
            </Text>
          </Flex>
        </Flex>
      </td>
      <td>
        <Flex alignItems="center" justifyContent="flex-end">
          <ActivityEventText marketEvent={activity.marketEvent} />
        </Flex>
        {isXs || isSm ? <ActivityPrice price={priceAsFloat} bnbBusdPrice={bnbBusdPrice} /> : null}
      </td>
      {isXs || isSm ? null : (
        <>
          <td>
            <ActivityPrice price={priceAsFloat} bnbBusdPrice={bnbBusdPrice} />
          </td>
          <td>
            <Flex justifyContent="flex-end" alignItems="center">
              {activity.otherParty ? <ProfileCell accountAddress={activity.otherParty} /> : '-'}
            </Flex>
          </td>
        </>
      )}
      <td>
        <Flex justifyContent="center">
          <Text textAlign="center" fontSize={isXs || isSm ? '12px' : '16px'}>
            {localeTimestamp}
          </Text>
        </Flex>
      </td>
      {isXs || isSm ? null : (
        <td>
          <IconButton as={Link} external href={getEtherscanLink(chainId, activity.tx, 'transaction')}>
            <OpenNewIcon color="textSubtle" width="18px" />
          </IconButton>
        </td>
      )}
    </tr>
  )
}

export default ActivityRow
