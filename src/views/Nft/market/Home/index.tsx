import React from 'react'
import styled from 'styled-components'
import { Box, Button, Heading, Flex } from 'maki-toolkit'
import { useWeb3React } from '@web3-react/core'
import { Link } from 'react-router-dom'
import { useTranslation } from 'contexts/Localization'
import PageHeader from 'components/PageHeader'
import SectionsWithFoldableText from 'components/FoldableSection/SectionsWithFoldableText'
import useTheme from 'hooks/useTheme'
import SearchBar from '../components/SearchBar'
import Collections from './Collections'
import Newest from './Newest'
import config from './config'

const Gradient = styled(Box)`
  background: ${({ theme }) => theme.colors.gradients.cardHeader};
`

const PageSection = styled.div`
  padding: 20px 32px;
`

const StyledHeaderInner = styled(Flex)`
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  & div:nth-child(1) {
    order: 1;
  }
  & div:nth-child(2) {
    order: 0;
    margin-bottom: 32px;
    align-self: end;
  }
  ${({ theme }) => theme.mediaQueries.sm} {
    flex-direction: row;
    & div:nth-child(1) {
      order: 0;
    }
    & div:nth-child(2) {
      order: 1;
      margin-bottom: 0;
      align-self: auto;
    }
  }
`

const Home = () => {
  const { t } = useTranslation()
  const { account } = useWeb3React()
  const { theme } = useTheme()

  return (
    <>
      <PageHeader>
        <StyledHeaderInner>
          <div>
            <Heading as="h1" scale="xxl" color="secondary" mb="24px">
              {t('NFT Market')}
            </Heading>
            <Heading scale="lg" color="text">
              {t('Buy and Sell NFTs on Huobi ECO Chain')}
            </Heading>
            {account && (
              <Button as={Link} to={`/profile/${account.toLowerCase()}`} mt="32px">
                {t('Manage/Sell')}
              </Button>
            )}
          </div>
          <SearchBar />
        </StyledHeaderInner>
      </PageHeader>
      <PageSection>
        <Collections />
        <Newest />
      </PageSection>
      <Gradient p="64px 0">
        <SectionsWithFoldableText header={t('FAQs')} config={config(t)} m="auto" />
      </Gradient>
    </>
  )
}

export default Home
