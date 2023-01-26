import { AgChart, AgChartOptions } from 'ag-charts-community';
import { getData } from "./data";


const options: AgChartOptions = {
  container: document.getElementById('myChart'),
  data: getData(),
  // INSERT OPTIONS HERE.
}

AgChart.create(options)
