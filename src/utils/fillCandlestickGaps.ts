import { CandlePeriod, NumericalCandlestickDatum } from 'config/constants/types'

/**
 * This function fills any whitespace for candlestick series data.
 */
export default function fillCandlestickGap(candleData: NumericalCandlestickDatum[], candlePeriod: CandlePeriod) {
  const formattedCandleData: NumericalCandlestickDatum[] = candleData.length > 0 ? [candleData[0]] : []
  if (formattedCandleData.length === 0) return formattedCandleData
  for (let i = 1; i < candleData.length; i++) {
    const cur = candleData[i]
    const prev = candleData[i - 1]
    const timeGap = cur.time - prev.time
    if (timeGap === candlePeriod) {
      formattedCandleData.push(cur)
      break
    }
    for (let j = 1; j < timeGap / candlePeriod; j++) {
      const emptyCandle = {
        time: prev.time + j * candlePeriod,
        open: prev.close,
        high: prev.close,
        low: prev.close,
        close: prev.close
      }
      formattedCandleData.push(emptyCandle)
    }
    formattedCandleData.push(cur)
  }

  // We fill remaining gaps until the current time
  const timestampNow = Math.floor(Number(new Date()) / 1000)
  const timestampOfNextCandle = timestampNow - (timestampNow % candlePeriod) + candlePeriod
  const prev = formattedCandleData[formattedCandleData.length - 1]
  const timeGap = timestampOfNextCandle - prev.time
  for (let j = 1; j <= timeGap / candlePeriod; j++) {
    const emptyCandle = {
      time: prev.time + j * candlePeriod,
      open: prev.close,
      high: prev.close,
      low: prev.close,
      close: prev.close
    }
    formattedCandleData.push(emptyCandle)
  }
  return formattedCandleData
}