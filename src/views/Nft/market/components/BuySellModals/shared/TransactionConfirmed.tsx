import React from 'react'
import { Flex, Text, Button, LinkExternal } from 'maki-toolkit-v3'
import { ArrowUpIcon } from 'components/Svg'
import { useTranslation } from 'contexts/Localization'
import { getEtherscanLink } from 'utils'
import { useActiveWeb3React } from 'hooks'
import { Divider } from './styles'

interface TransactionConfirmedProps {
  txHash: string
  onDismiss: () => void
}

const TransactionConfirmed: React.FC<TransactionConfirmedProps> = ({ txHash, onDismiss }) => {
  const { chainId } = useActiveWeb3React()
  const { t } = useTranslation()
  return (
    <>
      <Flex p="16px" flexDirection="column" alignItems="center" justifyContent="space-between" height="150px">
        <ArrowUpIcon width="64px" height="64px" color="primary" />
        <Text bold>{t('Transaction Confirmed')}</Text>
        <LinkExternal href={getEtherscanLink(chainId, txHash, 'transaction')}>{t('View on BscScan')}</LinkExternal>
      </Flex>
      <Divider />
      <Flex px="16px" pb="16px" justifyContent="center">
        <Button onClick={onDismiss} variant="secondary" width="100%">
          {t('Close')}
        </Button>
      </Flex>
    </>
  )
}

export default TransactionConfirmed
