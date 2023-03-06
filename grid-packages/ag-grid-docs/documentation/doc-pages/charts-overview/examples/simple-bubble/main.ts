import { AgChart, AgChartOptions } from 'ag-charts-community';
import { getData } from "./data";

const year = new Date().getFullYear();
const options: AgChartOptions = {
  container: document.getElementById('myChart'),
  autoSize: true,
  data: getData().filter(function (d) {
    return d.magnitude > 4
  }),
  title: {
    text: `Worldwide Earthquakes (first week of February ${year - 1})`,
    fontSize: 18,
  },
  subtitle: {
    text: 'Source: US Geological Survey',
  },
  series: [
    {
      type: 'scatter',
      xKey: 'depth',
      xName: 'Depth',
      yKey: 'magnitude',
      yName: 'Magnitude',
      sizeKey: 'minDistance',
      sizeName: 'Minimum Distance',
      marker: {
        size: 5,
        maxSize: 100,
        fill: '#41874b',
        stroke: '#41874b',
        fillOpacity: 0.5,
        strokeOpacity: 0.5,
      },
    },
  ],
  axes: [
    {
      position: 'bottom',
      type: 'number',
      title: {
        text: 'Depth (m)',
      },
    },
    {
      position: 'left',
      type: 'number',
      title: {
        text: 'Magnitude',
      },
    },
  ],
  legend: {
    enabled: false,
  },
}

var chart = AgChart.create(options)
