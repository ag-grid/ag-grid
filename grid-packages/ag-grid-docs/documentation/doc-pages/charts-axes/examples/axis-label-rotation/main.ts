import { AgCartesianChartOptions, AgBarSeriesOptions } from 'ag-charts-community'
import * as agCharts from 'ag-charts-community'
import { getData } from './data';

const byYearData = getData();

let columnSeries: AgBarSeriesOptions = {
  type: 'column',
  xKey: 'year',
  yKey: 'value',
};
const options: AgCartesianChartOptions = {
  container: document.getElementById('myChart'),
  data: byYearData,
  series: [columnSeries],
  axes: [
    {
      type: 'category',
      position: 'bottom',
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
  const element = document.getElementById('myChart')!;
  element.style.width = '';
  element.style.height = '';

  options.axes?.forEach((axis) => {
    axis.label = {
      ...(axis.label || {}),
    };
    delete axis.label['rotation'];
    delete axis.label['autoRotate'];
  });
  columnSeries.xKey = 'year';
  agCharts.AgChart.update(chart, options);
}

function disableRotation() {
  options.axes?.forEach((axis) => {
    axis.label = {
      ...(axis.label || {}),
      autoRotate: false,
    };
    delete axis.label['rotation'];
  });
  agCharts.AgChart.update(chart, options);
}

function fixedRotation() {
  options.axes?.forEach((axis) => {
    axis.label = {
      ...(axis.label || {}),
      rotation: 45,
      autoRotate: false,
    };
  });
  agCharts.AgChart.update(chart, options);
}

function autoRotation() {
  options.axes?.forEach((axis) => {
    axis.label = {
      ...(axis.label || {}),
      autoRotate: true,
    };
    delete axis.label['rotation'];
  });
  agCharts.AgChart.update(chart, options);
}

function uniformLabels() {
  columnSeries.xKey = 'year';
  agCharts.AgChart.update(chart, options);
}

function irregularLabels() {
  columnSeries.xKey = 'country';
  agCharts.AgChart.update(chart, options);
}
