import { AgCartesianChartOptions, AgChart } from 'ag-charts-community';
import {maleHeightWeight, femaleHeightWeight} from './height-weight-data'

const options: AgCartesianChartOptions = {
  container: document.getElementById('myChart'),
  autoSize: true,
  title: {
    text: 'Weight vs Height (by gender)',
  },
  subtitle: {
    text: 'with name labels',
  },
  series: [
    {
      type: 'scatter',
      title: 'Male',
      data: maleHeightWeight,
      xKey: 'height',
      xName: 'Height',
      yKey: 'weight',
      yName: 'Weight',
      sizeKey: 'age',
      sizeName: 'Age',
      labelKey: 'name',
      marker: {
        shape: 'square',
        size: 6,
        maxSize: 30,
        fill: 'rgba(227,111,106,0.71)',
        stroke: '#9f4e4a',
      },
      label: {
        enabled: true,
      },
    },
    {
      type: 'scatter',
      title: 'Female',
      data: femaleHeightWeight,
      xKey: 'height',
      xName: 'Height',
      yKey: 'weight',
      yName: 'Weight',
      sizeKey: 'age',
      sizeName: 'Age',
      labelKey: 'name',
      marker: {
        size: 6,
        maxSize: 30,
        fill: 'rgba(123,145,222,0.71)',
        stroke: '#56659b',
      },
      label: {
        enabled: true,
      },
    },
  ],
  axes: [
    {
      type: 'number',
      position: 'bottom',
      title: {
        text: 'Height',
      },
      label: {
        rotation: 45,
        formatter: (params) => {
          return params.value + 'cm'
        },
      },
    },
    {
      type: 'number',
      position: 'left',
      title: {
        text: 'Weight',
      },
      label: {
        formatter: (params) => {
          return params.value + 'kg'
        },
      },
    },
  ],
}

var chart = AgChart.create(options)

function updateFontSize(event: any) {
  var value = +event.target.value

  options.series![0].label!.fontSize = value
  options.series![1].label!.fontSize = value
  AgChart.update(chart, options)

  document.getElementById('fontSizeSliderValue')!.innerHTML = String(value)
}
