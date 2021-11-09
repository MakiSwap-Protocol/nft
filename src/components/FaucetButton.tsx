import React from 'react'
import { Button, useModal } from 'maki-toolkit'
import { useTranslation } from 'contexts/Localization'
import FaucetModal from './FaucetModal'

const FaucetButton = (props) => {
  const { t } = useTranslation()
  const [onPresentClaimModal] = useModal(<FaucetModal />)

  return (
    <Button onClick={onPresentClaimModal} {...props}>
      {t('Claim HT')}
    </Button>
  )
}

export default FaucetButton
