import * as agCharts from 'ag-charts-community';
import { AgChartOptions } from 'ag-charts-community';
import { getData } from "./data";


const options: AgChartOptions = {
  container: document.getElementById('myChart'),
  data: getData(),
  // INSERT OPTIONS HERE.
}

agCharts.AgChart.create(options)
