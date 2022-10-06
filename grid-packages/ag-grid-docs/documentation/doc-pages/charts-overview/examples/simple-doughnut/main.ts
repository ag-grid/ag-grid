import * as agCharts from 'ag-charts-community';
import { AgChartOptions } from 'ag-charts-community';
import { getData } from "./data";

const data = getData();
const numFormatter = new Intl.NumberFormat('en-US');
const total = data.reduce((sum, d) => sum + d['2018/19'], 0);

const options: AgChartOptions = {
  container: document.getElementById('myChart'),
  autoSize: true,
  data,
  title: {
    text: 'Dwelling Fires (UK)',
    fontSize: 18,
  },
  subtitle: {
    text: 'Source: Home Office',
  },
  series: [
    {
      type: 'pie',
      calloutLabelKey: 'type',
      fillOpacity: 0.9,
      strokeWidth: 0,
      angleKey: '2018/19',
      sectorLabelKey: '2018/19',
      calloutLabel: {
        enabled: false,
      },
      sectorLabel: {
        color: 'white',
        fontWeight: 'bold',
        formatter: ({ datum, sectorLabelKey }) => {
          const value = datum[sectorLabelKey!];
          return numFormatter.format(value);
        }
      },
      title: {
        text: '2018/19',
      },
      innerRadiusRatio: 0.5,
      innerLabels: [
        {
          text: numFormatter.format(total),
          fontSize: 18,
          fontWeight: 'bold',
        },
        {
          text: 'Total',
        },
      ],
    },
  ],
}

var chart = agCharts.AgChart.create(options)
