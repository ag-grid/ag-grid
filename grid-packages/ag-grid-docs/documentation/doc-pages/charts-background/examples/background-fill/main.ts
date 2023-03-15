import { AgChartOptions, AgChart } from 'ag-charts-community';
import { getColors } from './colors';

const colors = getColors();

const options: AgChartOptions = {
  container: document.getElementById('myChart'),
  data: [
    { value: 56.9 },
    { value: 22.5 },
    { value: 6.8 },
    { value: 8.5 },
    { value: 2.6 },
    { value: 1.9 },
  ],
  series: [
    {
      type: 'pie',
      angleKey: 'value',
    },
  ],
  background: {
    fill: 'aliceblue',
  },
}

const chart = AgChart.create(options);

let index = 0;
setInterval(() => {
  if (++index === colors.length) {
    index = 0;
  }
  AgChart.updateDelta(chart, {
    background: {
      fill: colors[index],
    },
  });
}, 2000);
