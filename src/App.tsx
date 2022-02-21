import React, { lazy } from 'react'
import { Redirect, Router, Route, Switch } from 'react-router-dom'
import { ResetCSS } from 'maki-toolkit-v3'
import BigNumber from 'bignumber.js'
import useEagerConnect from 'hooks/useEagerConnect'
import { usePollCoreFarmData, usePollBlockNumber } from 'state/hooks' // removed: useFetchProfile
import GlobalStyle from './style/Global'
import Menu from './components/Menu'
import SuspenseWithChunkError from './components/SuspenseWithChunkError'
import ToastListener from './components/ToastListener'
import PageLoader from './components/PageLoader'
import history from './routerHistory'
// Only pool is included in the main bundle because of it's the most visited page'
const NFT = lazy(() => import('./views/Nft/market'))

// This config is required for number formating
BigNumber.config({
  EXPONENTIAL_AT: 1000,
  DECIMAL_PLACES: 80,
})

const App: React.FC = () => {
  usePollBlockNumber()
  useEagerConnect()
  // useFetchProfile()
  usePollCoreFarmData()

  return (
    <Router history={history}>
      <ResetCSS />
      <GlobalStyle />
      <Menu>
        <SuspenseWithChunkError fallback={<PageLoader />}>
          <Switch>
            <Route path="/">
              <NFT />
            </Route>
          </Switch>
        </SuspenseWithChunkError>
      </Menu>
      <ToastListener />
    </Router>
  )
}

export default React.memo(App)
