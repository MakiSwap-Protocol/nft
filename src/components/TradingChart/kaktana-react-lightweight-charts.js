import React from 'react'
import { createChart } from 'lightweight-charts'
import equal from 'fast-deep-equal'

/**
 * This is an existing wrapper library imported to the project locally because:
 * 1) The library uses an old version of lightweight-charts
 * 2) There was an issue adding priceFormat options
 * 3) It's easier to customise the colours
 *
 */
const addSeriesFunctions = {
  candlestick: 'addCandlestickSeries',
  line: 'addLineSeries',
  area: 'addAreaSeries',
  bar: 'addBarSeries',
  histogram: 'addHistogramSeries'
}

const colors = ['#008FFB', '#00E396', '#FEB019', '#FF4560', '#775DD0', '#F86624', '#A5978B']

const darkTheme = {
  layout: {
    backgroundColor: '#131722',
    lineColor: '#2B2B43',
    textColor: '#D9D9D9'
  },
  grid: {
    vertLines: {
      color: '#363c4e'
    },
    horzLines: {
      color: '#363c4e'
    }
  }
}

const lightTheme = {
  layout: {
    backgroundColor: '#FFFFFF',
    lineColor: '#2B2B43',
    textColor: '#191919'
  },
  grid: {
    vertLines: {
      color: '#e1ecf2'
    },
    horzLines: {
      color: '#e1ecf2'
    }
  }
}

class ChartWrapper extends React.Component {
  constructor(props) {
    super(props)
    this.chartDiv = React.createRef()
    this.legendDiv = React.createRef()
    this.chart = null
    this.series = []
    this.legends = []
  }

  componentDidMount() {
    this.chart = createChart(this.chartDiv.current)
    this.handleUpdateChart()
    this.resizeHandler()
  }

  componentDidUpdate(prevProps) {
    const { autoWidth, autoHeight, onCrosshairMove, onTimeRangeMove, onClick, options, darkTheme: darkThemeCurrent, candlestickSeries, lineSeries, areaSeries, barSeries, histogramSeries, from, to } = this.props
    const { onCrosshairMove: onCrosshairMovePrev, onTimeRangeMove: onTimeRangeMovePrev, onClick: onClickPrev, options: optionsPrev, darkTheme: darkThemePrev, candlestickSeries: candlestickSeriesPrev, lineSeries: lineSeriesPrev, areaSeries: areaSeriesPrev, barSeries: barSeriesPrev, histogramSeries: histogramSeriesPrev, from: fromPrev, to: toPrev } = prevProps
    if (!autoWidth && !autoHeight) window.removeEventListener('resize', this.resizeHandler)
    if (
      !equal(
        [onCrosshairMovePrev, onTimeRangeMovePrev, onClickPrev],
        [onCrosshairMove, onTimeRangeMove, onClick]
      )
    )
      this.unsubscribeEvents(prevProps)
    if (
      !equal(
        [
          optionsPrev,
          darkThemePrev,
          candlestickSeriesPrev,
          lineSeriesPrev,
          areaSeriesPrev,
          barSeriesPrev,
          histogramSeriesPrev
        ],
        [
          options,
          darkThemeCurrent,
          candlestickSeries,
          lineSeries,
          areaSeries,
          barSeries,
          histogramSeries
        ]
      )
    ) {
      this.removeSeries()
      this.handleUpdateChart()
    } else if (fromPrev !== from || toPrev !== to) this.handleTimeRange()
  }

  resizeHandler = () => {
    const { autoWidth, autoHeight, height: heightProp } = this.props
    const width = autoWidth && this.chartDiv.current && this.chartDiv.current.parentNode.clientWidth
    const height =
      autoHeight && this.chartDiv.current
        ? this.chartDiv.current.parentNode.clientHeight
        : heightProp || 500
    this.chart.resize(width, height)
  }

  removeSeries = () => {
    this.series.forEach(serie => this.chart.removeSeries(serie))
    this.series = []
  }

  addSeries = (serie, type) => {
    const func = addSeriesFunctions[type]
    const color = (serie.options && serie.options.color) || colors[this.series.length % colors.length]
    const series = this.chart[func]({
      color,
      ...serie.options
    })
    const data = this.handleLinearInterpolation(serie.data, serie.linearInterpolation)
    series.setData(data)
    if (serie.markers) series.setMarkers(serie.markers)
    if (serie.priceLines) serie.priceLines.forEach(line => series.createPriceLine(line))
    if (serie.legend) this.addLegend(series, color, serie.legend)
    return series
  }

  handleSeries = () => {
    const series = this.series
    const props = this.props
    if (props.candlestickSeries) {
      props.candlestickSeries.forEach(serie => {
        series.push(this.addSeries(serie, 'candlestick'))
      })
    }

    if (props.lineSeries) {
      props.lineSeries.forEach(serie => {
        series.push(this.addSeries(serie, 'line'))
      })
    }

    if (props.areaSeries) {
      props.areaSeries.forEach(serie => {
        series.push(this.addSeries(serie, 'area'))
      })
    }

    if (props.barSeries) {
      props.barSeries.forEach(serie => {
        series.push(this.addSeries(serie, 'bar'))
      })
    }

    if (props.histogramSeries) {
      props.histogramSeries.forEach(serie => {
        series.push(this.addSeries(serie, 'histogram'))
      })
    }
  }

  unsubscribeEvents = prevProps => {
    const chart = this.chart
    chart.unsubscribeClick(prevProps.onClick)
    chart.unsubscribeCrosshairMove(prevProps.onCrosshairMove)
    chart.timeScale().unsubscribeVisibleTimeRangeChange(prevProps.onTimeRangeMove)
  }

  handleEvents = () => {
    const chart = this.chart
    const props = this.props
    if (props.onClick)
      chart.subscribeClick(props.onClick)
    if (props.onCrosshairMove)
      chart.subscribeCrosshairMove(props.onCrosshairMove)
    if (props.onTimeRangeMove)
      chart.timeScale().subscribeVisibleTimeRangeChange(props.onTimeRangeMove)

    // handle legend dynamical change
    chart.subscribeCrosshairMove(this.handleLegends)
  }

  handleTimeRange = () => {
    const { from, to } = this.props
    if(from && to)
      this.chart.timeScale().setVisibleRange({ from, to })
  }

  handleLinearInterpolation = (data, candleTime) => {
    if (!candleTime || data.length < 2 || !data[0].value) return data
    const first = data[0].time
    const last = data[data.length - 1].time
    const newData = new Array(Math.floor((last - first) / candleTime))
    newData[0] = data[0]
    let index = 1
    for (let i = 1; i < data.length; i++) {
      newData[index++] = data[i]
      const prevTime = data[i - 1].time
      const prevValue = data[i - 1].value
      const { time, value } = data[i]
      for (let interTime = prevTime; interTime < time - candleTime; interTime += candleTime) {
        // interValue get from the Taylor-Young formula
        const interValue = prevValue + (interTime - prevTime) * ((value - prevValue) / (time - prevTime))
        newData[index++] = { time: interTime, value: interValue }
      }
    }
    // return only the valid values
    return newData.filter(x => x)
  }

  handleUpdateChart = () => {
    window.removeEventListener('resize', this.resizeHandler)
    const { chart, chartDiv } = this
    const props = this.props
    const { darkTheme: darkThemeProp, legend } = this.props
    let options = darkThemeProp ? darkTheme : lightTheme
    options = mergeDeep(options, {
      width: props.autoWidth ? chartDiv.current.parentNode.clientWidth : props.width,
      height: props.autoHeight ? chartDiv.current.parentNode.clientHeight : props.height || 500,
      ...props.options
    })
    chart.applyOptions(options)
    if (this.legendDiv.current) this.legendDiv.current.innerHTML = ''
    this.legends = []
    if (legend) this.handleMainLegend()

    this.handleSeries()
    this.handleEvents()
    this.handleTimeRange()

    if (props.autoWidth || props.autoHeight)
      // resize the chart with the window
      window.addEventListener('resize', this.resizeHandler)
  }

  addLegend = (series, color, title) => {
    this.legends.push({ series, color, title })
  }

  handleLegends = param => {
    const div = this.legendDiv.current
    if (param.time && div && this.legends.length) {
      div.innerHTML = ''
      this.legends.forEach(({ series, color, title }) => {
        let price = param.seriesPrices.get(series)
        if (price !== undefined) {
          if (typeof price === 'object') {
            color = price.open < price.close ? 'rgba(0, 150, 136, 0.8)' : 'rgba(255,82,82, 0.8)'
            price = `O: ${price.open}, H: ${price.high}, L: ${price.low}, C: ${price.close}`
          }
          const row = document.createElement('div')
          row.innerText = `${title} `
          const priceElem = document.createElement('span')
          priceElem.style.color = color
          priceElem.innerText = ` ${price}`
          row.appendChild(priceElem)
          div.appendChild(row)
        }
      })
    }
  }

  handleMainLegend = () => {
    const { legend } = this.props
    if (this.legendDiv.current) {
      const row = document.createElement('div')
      row.innerText = legend
      this.legendDiv.current.appendChild(row)
    }
  }

  render() {
    const { darkTheme: darkThemeProp } = this.props
    const color = darkThemeProp ? darkTheme.layout.textColor : lightTheme.layout.textColor

    return (
      <div ref={this.chartDiv} style={{ position: 'relative' }}>
        <div
          ref={this.legendDiv}
          style={{
            position: 'absolute',
            zIndex: 2,
            color,
            padding: 10
          }}
        />
      </div>
    )
  }
}

export default ChartWrapper
export * from 'lightweight-charts'

const isObject = item => item && typeof item === 'object' && !Array.isArray(item)

const mergeDeep = (target, source) => {
  const output = { ...target }
  if (isObject(target) && isObject(source)) {
    Object.keys(source).forEach(key => {
      if (isObject(source[key])) {
        if (!(key in target)) Object.assign(output, { [key]: source[key] })
        else output[key] = mergeDeep(target[key], source[key])
      } else {
        Object.assign(output, { [key]: source[key] })
      }
    })
  }
  return output
}
