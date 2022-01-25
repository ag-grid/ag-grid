import { AgChartOptions } from '@ag-grid-community/core'
import * as agCharts from 'ag-charts-community'

const options: AgChartOptions = {
  container: document.getElementById('myChart'),
  autoSize: true,
  data: getData(),
  background: {
    fill: '#ecf2f9',
  },
  padding: {
    top: 10,
    bottom: 30,
    left: 10,
    right: 10,
  },
  title: {
    text: 'Marriage Statistics (Northern Ireland)',
    fontFamily: 'Georgia, Times New Roman, Times, Serif',
    fontSize: 22,
    color: '#162c53',
  },
  subtitle: {
    text: 'Source: Northern Ireland Statistics and Research Agency',
    fontSize: 10,
    color: '#3f7cbf',
    fontStyle: 'italic',
  },
  series: [
    {
      type: 'line',
      xKey: 'year',
      yKey: 'marriages',
      yName: 'Marriages',
      stroke: '#3d7ab0',
      strokeWidth: 5,
      marker: {
        enabled: false,
        fill: '#3d7ab0',
      },
    },
    {
      type: 'line',
      xKey: 'year',
      yKey: 'civilPartnerships',
      yName: 'Civil partnerships',
      stroke: '#b03d65',
      strokeWidth: 5,
      marker: {
        enabled: false,
        fill: '#b03d65',
      },
    },
    {
      type: 'line',
      xKey: 'year',
      yKey: 'divorces',
      yName: 'Divorces',
      stroke: '#80b03d',
      strokeWidth: 5,
      marker: {
        enabled: false,
        fill: '#80b03d',
      },
    },
  ],
  axes: [
    {
      position: 'top',
      type: 'time',
      tick: {
        count: agCharts.time.year.every(10),
        width: 3,
        color: '#3f7cbf',
      },
      nice: false,
      label: {
        rotation: -30,
        color: '#3f7cbf',
        fontWeight: 'bold',
        fontSize: 14,
        fontFamily: 'Impact, Charcoal, Sans-Serif',
      },
      line: {
        color: '#3f7cbf',
      },
      gridStyle: [
        { stroke: '#c1d832', lineDash: [6, 3] },
        { stroke: '#162c53', lineDash: [10, 5] },
      ],
    },
    {
      position: 'right',
      type: 'number',
      tick: {
        count: 20,
        size: 10,
      },
      nice: false,
      label: {
        color: '#3f7cbf',
        fontWeight: 'bold',
        fontSize: 14,
        fontFamily: 'Impact, Charcoal, Sans-Serif',
        formatter: params =>
          params.index % 2 === 1 ? params.value / 1000 + 'k' : '',
      },
      title: {
        enabled: true,
        text: 'Total number',
        color: '#162c53',
        fontStyle: 'italic',
        fontWeight: 'bold',
        fontSize: 16,
        fontFamily: 'Georgia, Times New Roman, Times, Serif',
      },
      line: {
        color: '#326baf',
      },
    },
  ],
  legend: {
    position: 'bottom',
    item: {
      marker: {
        strokeWidth: 0,
        padding: 10,
        shape: 'diamond',
        size: 20
      },
      paddingX: 40,
      label: {
        fontWeight: "600",
        color: '#3f7cbf',
        fontSize: 14,
        fontFamily: 'Georgia, Times New Roman, Times, Serif',
      }
    },
    spacing: 10,
  },
}

var chart = agCharts.AgChart.create(options)
