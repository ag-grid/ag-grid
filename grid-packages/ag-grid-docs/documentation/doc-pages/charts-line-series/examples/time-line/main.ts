import { AgChartOptions, AgChart } from 'ag-charts-community'

const options: AgChartOptions = {
  container: document.getElementById('myChart'),
  autoSize: true,
  series: [
    {
      data: [
        {
          time: new Date('01 Jan 2020 13:25:30 GMT'),
          sensor: 25,
        },
        {
          time: new Date('01 Jan 2020 13:26:30 GMT'),
          sensor: 24,
        },
        {
          time: new Date('01 Jan 2020 13:27:30 GMT'),
          sensor: 24,
        },
        {
          time: new Date('01 Jan 2020 13:28:30 GMT'),
          sensor: 23,
        },
        {
          time: new Date('01 Jan 2020 13:29:30 GMT'),
          sensor: 22.5,
        },
        {
          time: new Date('01 Jan 2020 13:30:30 GMT'),
          sensor: 21.5,
        },
        {
          time: new Date('01 Jan 2020 13:31:30 GMT'),
          sensor: 22.5,
        },
      ],
      xKey: 'time',
      yKey: 'sensor',
      yName: 'Lounge Temperature',
      stroke: '#03a9f4',
      marker: {
        fill: '#03a9f4',
        stroke: '#0276ab',
      },
    },
    {
      data: [
        {
          time: Date.parse('01 Jan 2020 13:25:00 GMT'),
          sensor: 21,
        },
        {
          time: Date.parse('01 Jan 2020 13:26:00 GMT'),
          sensor: 22,
        },
        {
          time: Date.parse('01 Jan 2020 13:28:00 GMT'),
          sensor: 22,
        },
        {
          time: Date.parse('01 Jan 2020 13:29:00 GMT'),
          sensor: 23,
        },
        {
          time: Date.parse('01 Jan 2020 13:30:00 GMT'),
          sensor: 24,
        },
        {
          time: Date.parse('01 Jan 2020 13:31:00 GMT'),
          sensor: 24,
        },
        {
          time: Date.parse('01 Jan 2020 13:32:00 GMT'),
          sensor: 24.5,
        },
        {
          time: Date.parse('01 Jan 2020 13:33:00 GMT'),
          sensor: 24.5,
        },
      ],
      xKey: 'time',
      yKey: 'sensor',
      yName: 'Office Temperature',
      stroke: '#8bc24a',
      marker: {
        fill: '#8bc24a',
        stroke: '#658d36',
      },
    },
  ],
  axes: [
    {
      type: 'time',
      position: 'bottom',
    },
    {
      type: 'number',
      position: 'left',
      label: {
        format: '#{.1f} °C',
      },
    },
  ],
  legend: {
    position: 'bottom',
  },
}

AgChart.create(options)
