import { AgCartesianChartOptions, AgBarSeriesOptions } from 'ag-charts-community'
import * as agCharts from 'ag-charts-community'
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
      label: {
        formatter: (params) => {
          return params.value + '%'
        },
      },
    },
  ],
  legend: {
    enabled: false,
  },
}

const chart = agCharts.AgChart.create(options);

function reset() {
  const element = document.getElementsByClassName('ag-chart-wrapper')![0]! as HTMLElement;
  element.style.width = '100%';
  element.style.height = '100%';

  delete options.axes![0].label!.rotation;
  delete options.axes![0].label!.autoRotate;
  delete options.axes![0].label!.autoCollisionRemoval;
  delete options.axes![1].label!.rotation;
  delete options.axes![1].label!.autoRotate;
  delete options.axes![1].label!.autoCollisionRemoval;

  options.series![0].xKey = 'year';
  agCharts.AgChart.update(chart, options);
}

function disableRotation() {
  delete options.axes![0].label!.rotation;
  delete options.axes![1].label!.rotation;
  options.axes![0].label!.autoRotate = false;
  options.axes![1].label!.autoRotate = false;

  agCharts.AgChart.update(chart, options);
}

function fixedRotation() {
  options.axes![0].label!.rotation = 45;
  options.axes![1].label!.rotation = 45;
  options.axes![0].label!.autoRotate = false;
  options.axes![1].label!.autoRotate = false;

  agCharts.AgChart.update(chart, options);
}

function autoRotation() {
  delete options.axes![0].label!.rotation;
  delete options.axes![1].label!.rotation;
  options.axes![0].label!.autoRotate = true;
  options.axes![1].label!.autoRotate = true;

  agCharts.AgChart.update(chart, options);
}

function uniformLabels() {
  options.series![0].xKey = 'year';
  agCharts.AgChart.update(chart, options);
}

function irregularLabels() {
  options.series![0].xKey = 'country';
  agCharts.AgChart.update(chart, options);
}

function noCollisionDetection() {
  options.axes![0].label!.autoCollisionRemoval = false;
  options.axes![1].label!.autoCollisionRemoval = false;

  agCharts.AgChart.update(chart, options);
}

function autoCollisionDetection() {
  options.axes![0].label!.autoCollisionRemoval = true;
  options.axes![1].label!.autoCollisionRemoval = true;

  agCharts.AgChart.update(chart, options);
}
