import { AgCartesianChartOptions, AgBarSeriesOptions, AgChart } from 'ag-charts-community'
import { getData } from './data';

const options: AgCartesianChartOptions = {
  container: document.getElementById('myChart'),
  data: getData(),
  series: [{
    type: 'column',
    xKey: 'year',
    yKey: 'value',
  }],
  axes: [
    {
      type: 'category',
      position: 'bottom',
      label: {},
    },
    {
      type: 'number',
      position: 'left',
      label: {},
    },
  ],
  legend: {
    enabled: false,
  },
}

const chart = AgChart.create(options);

function reset() {
  const element = document.getElementsByClassName('ag-chart-wrapper')![0]! as HTMLElement;
  element.style.width = '100%';
  element.style.height = '100%';

  delete options.axes![0].label!.rotation;
  delete options.axes![0].label!.autoRotate;
  delete options.axes![0].label!.avoidCollisions;
  delete options.axes![1].label!.rotation;
  delete options.axes![1].label!.autoRotate;
  delete options.axes![1].label!.avoidCollisions;

  options.series![0].xKey = 'year';
  AgChart.update(chart, options);
}

function disableRotation() {
  delete options.axes![0].label!.rotation;
  delete options.axes![1].label!.rotation;
  options.axes![0].label!.autoRotate = false;
  options.axes![1].label!.autoRotate = false;

  AgChart.update(chart, options);
}

function fixedRotation() {
  options.axes![0].label!.rotation = 45;
  options.axes![1].label!.rotation = 45;
  options.axes![0].label!.autoRotate = false;
  options.axes![1].label!.autoRotate = false;

  AgChart.update(chart, options);
}

function autoRotation() {
  delete options.axes![0].label!.rotation;
  delete options.axes![1].label!.rotation;
  options.axes![0].label!.autoRotate = true;
  options.axes![1].label!.autoRotate = true;

  AgChart.update(chart, options);
}

function uniformLabels() {
  options.series![0].xKey = 'year';
  AgChart.update(chart, options);
}

function irregularLabels() {
  options.series![0].xKey = 'country';
  AgChart.update(chart, options);
}

function noCollisionDetection() {
  options.axes![0].label!.avoidCollisions = false;
  options.axes![1].label!.avoidCollisions = false;

  AgChart.update(chart, options);
}

function autoCollisionDetection() {
  options.axes![0].label!.avoidCollisions = true;
  options.axes![1].label!.avoidCollisions = true;

  AgChart.update(chart, options);
}
