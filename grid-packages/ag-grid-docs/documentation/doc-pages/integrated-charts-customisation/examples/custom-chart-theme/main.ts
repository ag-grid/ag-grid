import {
  ColDef,
  createGrid,
  CreateRangeChartParams,
  FirstDataRenderedEvent,
  GridApi,
  GridOptions,
  GridReadyEvent,
} from '@ag-grid-community/core';
import { getData } from "./data";

let gridApi: GridApi;

// Define Column Definitions
const columnDefs: ColDef[] = [
  { field: 'country', width: 150, chartDataType: 'category' },
  { field: 'gold', chartDataType: 'series' },
  { field: 'silver', chartDataType: 'series' },
  { field: 'bronze', chartDataType: 'series' },
  {
    headerName: 'A',
    valueGetter: 'Math.floor(Math.random()*1000)',
    chartDataType: 'series',
  },
  {
    headerName: 'B',
    valueGetter: 'Math.floor(Math.random()*1000)',
    chartDataType: 'series',
  },
  {
    headerName: 'C',
    valueGetter: 'Math.floor(Math.random()*1000)',
    chartDataType: 'series',
  },
  {
    headerName: 'D',
    valueGetter: 'Math.floor(Math.random()*1000)',
    chartDataType: 'series',
  },
]

// Grid Options
const gridOptions: GridOptions = {
  defaultColDef: {
    editable: true,
    sortable: true,
    flex: 1,
    minWidth: 100,
    filter: true,
    resizable: true,
  },
  columnDefs,
  popupParent: document.body,
  enableRangeSelection: true,
  enableCharts: true,
  chartThemes: ['myCustomTheme', 'ag-pastel', 'ag-vivid'],
  customChartThemes: {
    myCustomTheme: {
      palette: {
        fills: ['#e1ba00', 'silver', 'peru'],
        strokes: ['black', '#ff0000'],
      },
      overrides: {
        common: {
          background: {
            fill: '#e5e5e5',
          },
          title: {
            enabled: true,
            fontStyle: 'italic',
            fontWeight: '600',
            fontSize: 18,
            fontFamily: 'Impact, sans-serif',
            color: '#414182',
          },
          legend: {
            position: 'left',
            spacing: 2,
            item: {
              label: {
                fontStyle: 'italic',
                fontWeight: 'bold',
                fontSize: 18,
                fontFamily: 'Palatino, serif',
                color: '#555',
              },
              marker: {
                shape: 'diamond',
                size: 10,
                padding: 10,
                strokeWidth: 2,
              },
              paddingX: 120,
              paddingY: 20,
            },
          },
        },
        bar: {
          axes: {
            number: {
              bottom: {
                line: {
                  width: 5,
                },
              },
            },
            category: {
              left: {
                line: {
                  width: 2,
                },
              },
            },
          },
        },
      },
    },
  },
  onGridReady,
  onFirstDataRendered,
};

function onGridReady(params: GridReadyEvent) {
  getData().then(rowData => params.api.setRowData(rowData));
}

function onFirstDataRendered(params: FirstDataRenderedEvent) {
  const cellRange = {
    rowStartIndex: 0,
    rowEndIndex: 4,
    columns: ['country', 'gold', 'silver', 'bronze'],
  };

  const chartParams: CreateRangeChartParams = {
    cellRange,
    chartType: 'groupedBar',
  };

  params.api.createRangeChart(chartParams);
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
  const gridDiv = document.querySelector<HTMLElement>('#myGrid')!
  gridApi = createGrid(gridDiv, gridOptions);
})
