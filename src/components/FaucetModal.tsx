import React, { useCallback, useContext, useState } from 'react'
import { useWeb3React } from '@web3-react/core'
import { Modal, Text, LinkExternal, Flex, Box, Button, Input } from 'maki-toolkit'
import { useTranslation } from 'contexts/Localization'
import axios from 'axios'
import Loader from 'components/Loader'
import { ThemeContext } from 'styled-components'

interface ClaimModalProps {
  onDismiss?: () => void
}

const ClaimModal: React.FC<ClaimModalProps> = ({ onDismiss }) => {
  const { t } = useTranslation()
  const { account } = useWeb3React()
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const theme = useContext(ThemeContext)

  const claimAirdrop = useCallback(async () => {
    setLoading(true)
    try {
      await axios.post("https://makiswap.xyz/api/users/faucet", {
        address: account
      })
      setMessage("Claim successful!")
      setLoading(false)
    } catch (e) {
      setError(e.response.data)
      setLoading(false)
    }
    // setMessage(response)
  }, [account])

  return (
    <Modal title={t('MAKI HT CLAIM')} onDismiss={onDismiss}>
      <Flex justifyContent="center">
        <Box maxWidth="320px">
          <Text fontSize="14px">
            {t('Enter an address to trigger a HT claim. If the address has any claimable HT it will be sent to them on submission.')}
          </Text>
          <Text color="red">{error}</Text>
          <Text color="green">{message}</Text>
          <Button width="100%" mt="16px" color={theme.colors.background} onClick={claimAirdrop}>
            {loading ? <Loader stroke="white" /> : "Claim HT"}
          </Button>
        </Box>
      </Flex>
    </Modal>
  )
}

export default ClaimModal
