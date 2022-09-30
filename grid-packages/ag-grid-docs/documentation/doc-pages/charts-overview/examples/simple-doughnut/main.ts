import * as agCharts from 'ag-charts-community';
import { AgChartOptions } from 'ag-charts-community';
import { getData } from "./data";

const data = getData();
const numberFormatter = new Intl.NumberFormat('en-US');
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
      labelKey: 'type',
      fillOpacity: 0.9,
      strokeWidth: 0,
      angleKey: '2018/19',
      sectorLabelKey: '2018/19',
      label: {
        enabled: false,
      },
      sectorLabel: {
        color: 'white',
        fontWeight: 'bold',
        formatter: ({ datum, sectorLabelKey }) => {
          const value = datum[sectorLabelKey!];
          return numberFormatter.format(value);
        }
      },
      title: {
        text: '2018/19',
      },
      innerRadiusRatio: 0.5,
      innerLabels: [
        {
          text: numberFormatter.format(total),
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
