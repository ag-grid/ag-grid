import { AgChartOptions, AgChart, time } from 'ag-charts-community'

const options: AgChartOptions = {
  container: document.getElementById('myChart'),
  title: {
    text: 'Monthly average daily temperatures in the UK',
  },
  series: [
    {
      type: 'line',
      xKey: 'date',
      yKey: 'temp',
    },
  ],
  axes: [
    {
      type: 'number',
      position: 'left',
      label: {
        format: '🌧️ #{0>2.0f} °C',
      },
    },
    {
      type: 'time',
      nice: false,
      position: 'bottom',
      tick: {
        interval: time.month,
      },
      label: {
        format: '%b %Y',
      },
    },
  ],
  padding: {
    top: 20,
    right: 40,
    bottom: 20,
    left: 20,
  },
  legend: {
    enabled: false,
  },
  data: [
    {
      date: new Date('01 Jan 2019 00:00:00 GMT'),
      temp: 4.2,
    },
    {
      date: new Date('01 Feb 2019 00:00:00 GMT'),
      temp: 6.9,
    },
    {
      date: new Date('01 Mar 2019 00:00:00 GMT'),
      temp: 7.9,
    },
    {
      date: new Date('01 Apr 2019 00:00:00 GMT'),
      temp: 9.1,
    },
    {
      date: new Date('01 May 2019 00:00:00 GMT'),
      temp: 11.2,
    },
  ],
}

AgChart.create(options)
