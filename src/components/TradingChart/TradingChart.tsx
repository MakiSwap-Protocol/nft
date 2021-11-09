import React, { useContext, useEffect, useState } from 'react'
import styled, { ThemeContext } from 'styled-components'
import { Text, Flex } from 'maki-toolkit'
import { Currency, Token, HUOBI, WHT, ChainId } from 'maki-sdk'
import { darken } from 'polished'
import { BusinessDay, TickMarkType, UTCTimestamp } from 'lightweight-charts'

import { formatNumber } from 'utils/formatBalance'
import CurrencyLogo from 'components/CurrencyLogo'

import { useActiveWeb3React } from 'hooks'
import { CandlePeriod, NumericalCandlestickDatum } from 'config/constants/types'
import fillCandlestickGaps from 'utils/fillCandlestickGaps'
import useWindowDimensions from 'hooks/useWindowDimensions'
import { usePair } from 'data/Reserves'
import { getHourlyRateData } from 'utils'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import { useBlockNumber } from 'state/application/hooks'
import TVChart from './kaktana-react-lightweight-charts'

dayjs.extend(utc)

interface ChartProps {
  inputCurrency: Currency | Token | undefined
  outputCurrency: Currency | Token | undefined
}

const ChartHeaderWrapper = styled.div`
  display: flex;
  justify-content: center;

  ${({ theme }) => theme.mediaQueries.sm} {
    justify-content: flex-start;
  }
`

const ChartSubHeader = styled(Flex)`
  margin-top: 1rem;
  flex-direction: column;
  align-items: center;
  ${({ theme }) => theme.mediaQueries.sm}{
    flex-direction: row;
    align-items: flex-end;
  }
`

// const PriceText = styled(Text)`
//   color: ${({ theme }) => theme.text2};
// `

const LastPriceHeaderWrapper = styled.div`
  font-size: 46px;
  color: ${({ theme }) => theme.colors.text};
`

const CandlePeriodsWrapper = styled.div`
  display: flex;
  justify-content: flex-end;
`

const FlexColumnWrapper = styled.div`
  display: flex;
  flex-direction: column;
  margin: 1rem;
`

const CandlePeriodButton = styled.div`
  padding: 0.5rem 0.75rem;
  margin: 0.25rem;
  border-radius: 10px;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 14px;
  font-weight: 400;
  cursor: pointer;
  background-color: ${({ theme }) => theme.colors.backgroundAlt};

  &:hover {
    background-color: ${({ theme }) => darken(0.05, theme.colors.backgroundAlt)};
  }

  &.selected {
    background-color: ${({ theme }) => theme.colors.background};
    color: ${({ theme }) => theme.colors.text};
    border: 1px solid ${({ theme }) => theme.colors.background};
  }
  border: none;
`

const ChartWrapper = styled.div<{ hasData: boolean }>`
  background-color: ${({ theme, hasData }) => !hasData && theme.colors.primaryDark};
  z-index: 999;
`

// We put Jan at the back because the tick mark for the first day of the next month is read from the last day of the
// previous month. E.g. the monthly tick mark shows for Dec 31, but we want it to show Jan to signal the start of Jan.
const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec']

export default function TradingChart({ inputCurrency, outputCurrency }: ChartProps) {
  const { chainId } = useActiveWeb3React()
  const theme = useContext(ThemeContext)
  const [candlePeriod, setCandlePeriod] = useState(CandlePeriod.OneHour)
  const [candlestickSeries, setCandlestickSeries] = useState<{ data: NumericalCandlestickDatum[] }[]>([{ data: [] }])

  // dynamically set chart width
  const { height, width } = useWindowDimensions()
  const chartWidth = Math.min(width - 16 - 16, 550)

  const pair = usePair(inputCurrency, outputCurrency);
  const pairAddress = pair && pair.length > 1 && pair[1] && pair[1].liquidityToken ? pair[1].liquidityToken.address : '';

  // A greater index denotes a greater major. -1 denotes altcoin.
  // const token0LCase = token0Index < token1Index ? inputAddress.toLowerCase() : outputAddress.toLowerCase()
  // const token1LCase = token0Index < token1Index ? outputAddress.toLowerCase() : inputAddress.toLowerCase()

  // const candleData: NumericalCandlestickDatum[] = useDexCandles(token0LCase, token1LCase, candlePeriod)

  const chartOptions = {
    // General chart options
    width: chartWidth,
    height: 300,
    layout: {
      backgroundColor: `${theme.colors.background}`,
      lineColor: '#2B2B43',
      textColor: `${theme.colors.textSecondary}`
    },
    priceFormat: {
      type: 'custom',
      minMove: 1 / (10 ** 10),
      formatter: (price: any) => {
        if (price < 0) return 0
        if (price < 0.001) return parseFloat(price).toFixed(10)
        if (price >= 0.001 && price < 1) return parseFloat(price).toFixed(6)
        return parseFloat(price).toFixed(3)
      }
    },
    priceScale: {
      position: 'left',
      autoScale: true,
      borderColor: `${theme.colors.textSecondary}`
    },
    timeScale: {
      visible: true,
      timeVisible: true,
      borderColor: `${theme.colors.textSecondary}`,
      tickMarkFormatter: (time: BusinessDay | UTCTimestamp, tickMarkType: TickMarkType) => {
        const date = new Date((time as UTCTimestamp) * 1000)
        const year = date.getFullYear()
        const month = monthNames[date.getMonth()]
        const day = date.getDate()
        const hour = date.getHours() < 10 ? `0${date.getHours()}` : date.getHours().toString()
        const minute = date.getMinutes() < 10 ? `0${date.getMinutes()}` : date.getMinutes().toString()
        const second = date.getSeconds() < 10 ? `0${date.getSeconds()}` : date.getSeconds().toString()
        if (tickMarkType === TickMarkType.Year)
          return year
        if (tickMarkType === TickMarkType.Month)
          return month
        if (tickMarkType === TickMarkType.DayOfMonth)
          return day
        if (tickMarkType === TickMarkType.Time)
          return `${hour}:${minute}`
        return `${hour}:${minute}:${second}`
      }
    },
    localization: {
      timeFormatter: (time: BusinessDay | UTCTimestamp) => {
        const date = new Date((time as UTCTimestamp) * 1000)
        const hours = date.getHours() < 10 ? `0${date.getHours()}` : date.getHours().toString()
        const minutes = date.getMinutes() < 10 ? `0${date.getMinutes()}` : date.getMinutes().toString()
        return `${hours}:${minutes}`
      },
      priceFormatter: (price: any) => {
        if (price < 0) return 0
        if (price < 0.001) return parseFloat(price).toFixed(10)
        if (price >= 0.001 && price < 0.01) return parseFloat(price).toFixed(8)
        if (price >= 0.01 && price < 1) return parseFloat(price).toFixed(6)
        return parseFloat(price).toFixed(3)
      }
    },
    crosshair: {
      vertLine: {
        width: 1.5,
        color: `${theme.colors.card}`,
        style: 2
      },
      horzLine: {
        width: 1.5,
        color: `${theme.colors.card}`,
        style: 2
      },
      mode: 0 // 0 = normal mode, 1 = magnet mode
    },
    grid: {
      vertLines: {
        visible: false
      },
      horzLines: {
        visible: false
      }
    },
    handleScale: {
      mouseWheel: true,
      axisPressedMouseMove: {
        time: false
      },
      pinch: false
    },
    // Candlestick series options
    upColor: `${theme.colors.success}`,
    borderUpColor: `${theme.colors.success}`,
    wickUpColor: `${theme.colors.success}`,
    downColor: `${theme.colors.failure}`,
    borderDownColor: `${theme.colors.failure}`,
    wickDOwnColor: `${theme.colors.failure}`
  }

  const latestBlockNumber = useBlockNumber()

  useEffect(() => {
    setCandlestickSeries([{ data: [] }]);
    (async() => {
      if (pairAddress !== '') {
        const currentTime = dayjs.utc()
        const timeType = candlePeriod === CandlePeriod.FiveMinutes || candlePeriod === CandlePeriod.FifteenMinutes ? 'minute' : candlePeriod === CandlePeriod.OneHour || candlePeriod === CandlePeriod.FourHours ? 'hour' : candlePeriod === CandlePeriod.OneDay ? 'day' : 'week'
        const startType = candlePeriod === CandlePeriod.FiveMinutes || candlePeriod === CandlePeriod.FifteenMinutes ? 'second' : candlePeriod === CandlePeriod.OneHour || candlePeriod === CandlePeriod.FourHours ? 'minute' : 'hour'
        const timeAmount = candlePeriod === CandlePeriod.FiveMinutes ? 5 : candlePeriod === CandlePeriod.FifteenMinutes ? 15 : candlePeriod === CandlePeriod.FourHours ? 4 : 1
        const startTime = currentTime.subtract(timeAmount, timeType).startOf(startType).unix()
        const pairChartData = await getHourlyRateData(pairAddress.toLowerCase(), inputCurrency, startTime, startType, latestBlockNumber);
        const candleData: NumericalCandlestickDatum[] = pairChartData.map((item: any) => { return { time: Number(item.timestamp), open: item.open, high: Math.max(item.open, item.close), low: Math.min(item.open, item.close), close: item.close } })
        const formattedCandleData: NumericalCandlestickDatum[] = fillCandlestickGaps(candleData, candlePeriod)
        setCandlestickSeries([{ data: formattedCandleData }])  
      }
    })();
  }, [candlePeriod, pairAddress, latestBlockNumber, inputCurrency])

  const hasData = candlestickSeries[0].data.length > 0
  const lastClose = hasData ? candlestickSeries[0].data[candlestickSeries[0].data.length - 1].close : undefined
  const fmtLastClose = lastClose ? lastClose < 0.01 ? formatNumber(lastClose, 5, 5) : formatNumber(lastClose) : 'N/A'

  return (
    <div style={{ padding: '1rem 2rem' }}>
      <FlexColumnWrapper>
        <ChartHeaderWrapper>
          {inputCurrency ? (
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <CurrencyLogo currency={inputCurrency} size='30px' />
              <Text style={{ marginLeft: '0.5rem' }}>{inputCurrency.symbol}</Text>
            </div>
          ) : (
            <></>
          )}

          {inputCurrency && outputCurrency ? (
            <Text style={{ margin: '0 1rem' }}>/</Text>
          ) : (
            <div />
          )}

          {outputCurrency ? (
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <CurrencyLogo currency={outputCurrency} size='30px' />
              <Text style={{ marginLeft: '0.5rem' }}>{outputCurrency.symbol}</Text>
            </div>
          ) : (
            <></>
          )}
        </ChartHeaderWrapper>
        <ChartSubHeader>
          <LastPriceHeaderWrapper>{fmtLastClose}</LastPriceHeaderWrapper>

          <CandlePeriodsWrapper>
            <CandlePeriodButton
              className={candlePeriod === CandlePeriod.FiveMinutes ? 'selected' : ''}
              onClick={() => setCandlePeriod(CandlePeriod.FiveMinutes)}
            >
              5m
            </CandlePeriodButton>
            <CandlePeriodButton
              className={candlePeriod === CandlePeriod.FifteenMinutes ? 'selected' : ''}
              onClick={() => setCandlePeriod(CandlePeriod.FifteenMinutes)}
            >
              15m
            </CandlePeriodButton>
            <CandlePeriodButton
              className={candlePeriod === CandlePeriod.OneHour ? 'selected' : ''}
              onClick={() => setCandlePeriod(CandlePeriod.OneHour)}
            >
              1H
            </CandlePeriodButton>
            <CandlePeriodButton
              className={candlePeriod === CandlePeriod.FourHours ? 'selected' : ''}
              onClick={() => setCandlePeriod(CandlePeriod.FourHours)}
            >
              4H
            </CandlePeriodButton>
            <CandlePeriodButton
              className={candlePeriod === CandlePeriod.OneDay ? 'selected' : ''}
              onClick={() => setCandlePeriod(CandlePeriod.OneDay)}
            >
              1D
            </CandlePeriodButton>
            <CandlePeriodButton
              className={candlePeriod === CandlePeriod.OneWeek ? 'selected' : ''}
              onClick={() => setCandlePeriod(CandlePeriod.OneWeek)}
            >
              1W
            </CandlePeriodButton>
          </CandlePeriodsWrapper>
        </ChartSubHeader>
        <ChartWrapper hasData={hasData}>
          <TVChart options={chartOptions} candlestickSeries={candlestickSeries} />
        </ChartWrapper>
        {!hasData && (
          <Text
            fontSize='14px'
            textAlign='center'
          >Unforunately, this pair doesn&rsquo;t have enough data.</Text>
        )}
      </FlexColumnWrapper>      
    </div>
  )
}
