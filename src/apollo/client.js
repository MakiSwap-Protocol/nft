import { ApolloClient } from 'apollo-client'
import { InMemoryCache } from 'apollo-cache-inmemory'
import { HttpLink } from 'apollo-link-http'

export const client = new ApolloClient({
  link: new HttpLink({
    uri: 'https://n10.hg.network/subgraphs/name/makiexchange/heco',
  }),
  cache: new InMemoryCache(),
  shouldBatch: true,
})

export const blockClient = new ApolloClient({
  link: new HttpLink({
    // uri: 'https://api.thegraph.com/subgraphs/name/blocklytics/ethereum-blocks',
    // uri: 'https://graph.mdex.com/subgraphs/name/mdex-heco-blocks',
    uri: 'https://n10.hg.network/subgraphs/name/makiblocks/heco',
    // uri: 'https://hq.hg.network/subgraphs/name/hscblocks/hsc',
  }),
  cache: new InMemoryCache(),
})
