import { Contract } from '@ethersproject/contracts'
import { getAddress } from '@ethersproject/address'
import { AddressZero } from '@ethersproject/constants'
import { JsonRpcSigner, Web3Provider } from '@ethersproject/providers'
import { BigNumber } from '@ethersproject/bignumber'
import { abi as IMakiswapRouterABI } from 'maki-swap-periphery/build/IMakiswapRouter02.json'
import { ChainId, JSBI, Percent, Token, CurrencyAmount, Currency, HUOBI } from 'maki-sdk'
import { TokenAddressMap } from 'state/lists/hooks'
import { ROUTER_ADDRESS } from 'config/constants'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import { client, blockClient } from 'apollo/client'
import { HOURLY_PAIR_RATES, GET_BLOCKS } from 'apollo/queries'

dayjs.extend(utc)

// returns the checksummed address if the address is valid, otherwise returns false
export function isAddress(value: any): string | false {
  try {
    return getAddress(value)
  } catch {
    return false
  }
}

const HUOBISCAN_PREFIXES: { [chainId in ChainId]: string } = {
  128: '',
  256: 'testnet.'
}

export function getEtherscanLink(chainId: ChainId, data: string, type: 'transaction' | 'token' | 'address'): string {
  const prefix = `https://${HUOBISCAN_PREFIXES[chainId] || HUOBISCAN_PREFIXES[128]}hecoinfo.com`

  switch (type) {
    case 'transaction': {
      return `${prefix}/tx/${data}`
    }
    case 'token': {
      return `${prefix}/token/${data}`
    }
    case 'address':
    default: {
      return `${prefix}/address/${data}`
    }
  }
}

// shorten the checksummed version of the input address to have 0x + 4 characters at start and end
export function shortenAddress(address: string, chars = 4): string {
  const parsed = isAddress(address)
  if (!parsed) {
    throw Error(`Invalid 'address' parameter '${address}'.`)
  }
  return `${parsed.substring(0, chars + 2)}...${parsed.substring(42 - chars)}`
}

// add 10%
export function calculateGasMargin(value: BigNumber): BigNumber {
  return value.mul(BigNumber.from(10000).add(BigNumber.from(1000))).div(BigNumber.from(10000))
}

// converts a basis points value to a sdk percent
export function basisPointsToPercent(num: number): Percent {
  return new Percent(JSBI.BigInt(Math.floor(num)), JSBI.BigInt(10000))
}

export function calculateSlippageAmount(value: CurrencyAmount, slippage: number): [JSBI, JSBI] {
  if (slippage < 0 || slippage > 10000) {
    throw Error(`Unexpected slippage value: ${slippage}`)
  }
  return [
    JSBI.divide(JSBI.multiply(value.raw, JSBI.BigInt(10000 - slippage)), JSBI.BigInt(10000)),
    JSBI.divide(JSBI.multiply(value.raw, JSBI.BigInt(10000 + slippage)), JSBI.BigInt(10000))
  ]
}

// account is not optional
export function getSigner(library: Web3Provider, account: string): JsonRpcSigner {
  return library.getSigner(account).connectUnchecked()
}

// account is optional
export function getProviderOrSigner(library: Web3Provider, account?: string): Web3Provider | JsonRpcSigner {
  return account ? getSigner(library, account) : library
}

// account is optional
export function getContract(address: string, ABI: any, library: Web3Provider, account?: string): Contract {
  if (!isAddress(address) || address === AddressZero) {
    throw Error(`Invalid 'address' parameter '${address}'.`)
  }

  return new Contract(address, ABI, getProviderOrSigner(library, account) as any)
}

// account is optional
export function getRouterContract(_: number, library: Web3Provider, account?: string): Contract {
  return getContract(ROUTER_ADDRESS, IMakiswapRouterABI, library, account)
}

export function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') // $& means the whole matched string
}

export function isTokenOnList(defaultTokens: TokenAddressMap, currency?: Currency): boolean {
  if (currency === HUOBI) return true
  return Boolean(currency instanceof Token && defaultTokens[currency.chainId]?.[currency.address])
}

export function convertHexToRGB(hexColor: string): string[] | null {
  const r = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/gi
  const match = r.exec(hexColor)
  if (!match || match.length < 2) {
    return null
  }
  const aRgbHex = match[1].match(/.{1,2}/g);
  if (aRgbHex) {
    return aRgbHex.map(str => parseInt(str, 16).toString())
  }
  return aRgbHex;
}

export async function getBlocksFromTimestamps(timestamps, skipCount = 500) {
  if (timestamps?.length === 0) {
    return []
  }

  const fetchedData = await splitQuery(GET_BLOCKS, blockClient, [], timestamps, skipCount)
  const blocks = [];
  if (fetchedData) {
    Object.keys(fetchedData).forEach(t => {
      if(fetchedData[t].length > 0) {
        blocks.push({
          timestamp: t.split('t')[1],
          number: fetchedData[t][0].number,
        });
      }
    })
  }

  return blocks
}

export async function splitQuery(query, localClient, vars, list, skipCount = 100) {
  let fetchedData = {}
  let allFound = false
  let skip = 0

  while (!allFound) {
    let end = list.length
    if (skip + skipCount < list.length) {
      end = skip + skipCount
    }
    const sliced = list.slice(skip, end)
    const result = await localClient.query({
      query: query(...vars, sliced),
      fetchPolicy: 'cache-first',
    })
    fetchedData = {
      ...fetchedData,
      ...result.data,
    }
    if (Object.keys(result.data).length < skipCount || skip + skipCount > list.length) {
      allFound = true
    } else {
      skip += skipCount
    }
  }

  return fetchedData
}

export const getHourlyRateData = async (pairAddress, inputCurrency, startTime, startType, latestBlock) => {
  try {
    const utcEndTime = dayjs.utc()
    let time = startTime

    // create an array of hour start times until we reach current hour
    const timestamps = []
    const timeDuration = startType === 'second' ? 2 : startType === 'minute' ? 60 : 3600
    while (time <= utcEndTime.unix() - timeDuration) {
      timestamps.push(time)
      time += timeDuration
    }

    // backout if invalid timestamp format
    if (timestamps.length === 0) {
      return []
    }

    // once you have all the timestamps, get the blocks for each timestamp in a bulk query
    let blocks

    blocks = await getBlocksFromTimestamps(timestamps, 100)

    // catch failing case
    if (!blocks || blocks?.length === 0) {
      return []
    }

    if (latestBlock) {
      blocks = blocks.filter((b) => {
        return parseFloat(b.number) <= parseFloat(latestBlock)
      })
    }

    const result = await splitQuery(HOURLY_PAIR_RATES, client, [pairAddress], blocks, 100)
    // format token HT price results
    const values = []
    Object.keys(result).forEach(row => {
      const timestamp = row.split('t')[1]
      if (timestamp) {
        values.push({
          timestamp,
          rate0: parseFloat(result[row]?.token0Price),
          rate1: parseFloat(result[row]?.token1Price),
          symbol0: result[row]?.token0.symbol,
          symbol1: result[row]?.token1.symbol,
          address0: result[row]?.token0.id,
          address1: result[row]?.token1.id
        })
      }
    });

    const formattedHistoryRate = []

    // for each hour, construct the open and close price
    for (let i = 0; i < values.length - 1; i++) {
      const isRate1 = inputCurrency.address ? values[i].address0.toLowerCase() === inputCurrency.address.toLowerCase() : values[i].symbol0 === 'WHT' && inputCurrency.symbol === 'HT'
      if (isRate1) {
        formattedHistoryRate.push({
          timestamp: values[i].timestamp,
          open: parseFloat(values[i].rate1),
          close: parseFloat(values[i + 1].rate1),
        })  
      } else {
        formattedHistoryRate.push({
          timestamp: values[i].timestamp,
          open: parseFloat(values[i].rate0),
          close: parseFloat(values[i + 1].rate0),
        })          
      }
    }

    return formattedHistoryRate
  } catch (e) {
    console.log(e)
    return []
  }
}
