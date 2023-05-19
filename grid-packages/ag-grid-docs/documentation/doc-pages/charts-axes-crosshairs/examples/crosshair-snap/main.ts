import { AgEnterpriseCharts, AgCartesianChartOptions } from "ag-charts-enterprise";
import { getData } from './data';

const options: AgCartesianChartOptions = {
  container: document.getElementById("myChart"),
  autoSize: true,
  data: getData(),
  title: {
    text: `United Kingdom Population`,
  },
  series: [
    {
      yKey: 'population',
      xKey: 'year',
      stroke: '#6769EB',
      marker: {
        fill: '#6769EB',
        stroke: '#6769EB',
      },
    }
  ],
  axes: [
    {
      type: "number",
      position: "left",
      label: {
        formatter: (params) => `${params.value / 1000000}M`,
      },
      crosshair: {
        snap: false,
      },
    },
    {
      type: "category",
      position: "bottom",
      title: {
        text: "Year",
      },
      crosshair: {
        snap: false,
      },
    },
  ],
  tooltip: {
    enabled: false
  }
}

AgEnterpriseCharts.create(options)
