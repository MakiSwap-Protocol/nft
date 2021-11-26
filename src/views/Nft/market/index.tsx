import React, { lazy } from 'react'
import { Redirect, Route } from 'react-router-dom'
import { useWeb3React } from '@web3-react/core'
import { useFetchCollections, useGetNFTInitializationState } from 'state/nftMarket/hooks'
import PageLoader from 'components/Loader/PageLoader'
import { NFTMarketInitializationState } from 'state/nftMarket/types'

const Home = lazy(() => import('./Home'))
const NftProfile = lazy(() => import('./Profile'))
const Collection = lazy(() => import('./Collection'))
const Collections = lazy(() => import('./Collections'))

const Market = () => {
  const { account } = useWeb3React()
  const initializationState = useGetNFTInitializationState()

  useFetchCollections()

  if (initializationState !== NFTMarketInitializationState.INITIALIZED) {
    return <PageLoader />
  }

  return (
    <>
      <Route exact path='/'>
        <Home />
      </Route>
      <Route exact path='/collections'>
        <Collections />
      </Route>
      <Route path='/collections/:collectionAddress'>
        <Collection />
      </Route>
      <Route path='/profile/:accountAddress?'>
        <NftProfile />
      </Route>
      <Route exact path='/profile'>
        <Redirect to={`/profile/${account?.toLowerCase() || ''}`} />
      </Route>
    </>
  )
}

export default Market
