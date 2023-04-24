import { AgChartOptions, AgChart } from 'ag-charts-community';

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

function random(n: any) {
  return Math.floor(Math.random() * (n + 1));
}

function randomColor() {
  const color = `rgb(${random(255)}, ${random(255)}, ${random(255)})`;
  AgChart.updateDelta(chart, {
    background: {
      fill: color,
    },
  });
}
