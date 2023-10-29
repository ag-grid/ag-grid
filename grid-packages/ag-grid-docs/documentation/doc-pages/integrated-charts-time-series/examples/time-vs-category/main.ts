import {
  ColDef,
  createGrid,
  CreateRangeChartParams,
  FirstDataRenderedEvent,
  GridApi,
  GridOptions,
  GridReadyEvent,
  ValueFormatterParams
} from '@ag-grid-community/core';
import {getData} from './data';

declare var moment: any;

let gridApi: GridApi;
let currentChartRef: any;

function getColumnDefs() {
  return [
    { field: 'date', valueFormatter: dateFormatter },
    { field: 'avgTemp' },
  ]
}

const gridOptions: GridOptions = {
  columnDefs: getColumnDefs(),
  defaultColDef: {
    flex: 1,
    resizable: true,
  },
  enableRangeSelection: true,
  enableCharts: true,
  chartThemeOverrides: {
    line: {
      title: {
        enabled: true,
        text: 'Average Daily Temperatures',
      },
      navigator: {
        enabled: true,
        height: 20,
        margin: 25,
      },
      axes: {
        time: {
          label: {
            rotation: 0,
            format: '%d %b',
          },
        },
        category: {
          label: {
            rotation: 0,
            formatter: (params) => {
              return formatDate(params.value);
            },
          },
        },
        number: {
          label: {
            formatter: (params) => {
              return params.value + '°C'
            },
          },
        },
      },
      series: {
        tooltip: {
          renderer: ({ xValue, yValue }) => {
            xValue = xValue instanceof Date ? xValue : new Date(xValue);
            return {
              content: `${formatDate(xValue)}: ${Math.round(yValue)}°C`,
            };
          },
        },
      },
    },
  },
  chartToolPanelsDef: {
    panels: ['data', 'format']
  },
  onGridReady,
  onFirstDataRendered,
};

function onGridReady(params: GridReadyEvent) {
  getData().then(rowData => params.api.setRowData(rowData));
}

function onFirstDataRendered(params: FirstDataRenderedEvent) {
  if (currentChartRef) {
    currentChartRef.destroyChart()
  }

  const createRangeChartParams: CreateRangeChartParams = {
    chartContainer: document.querySelector('#myChart') as any,
    suppressChartRanges: true,
    cellRange: {
      columns: ['date', 'avgTemp'],
    },
    chartType: 'line',
  }
  currentChartRef = params.api.createRangeChart(createRangeChartParams)
}

function dateFormatter(params: ValueFormatterParams) {
  return params.value
    ? params.value.toISOString().substring(0, 10)
    : params.value
}

function toggleAxis() {
  const axisBtn = document.querySelector('#axisBtn') as any;
  axisBtn.textContent = axisBtn.value
  axisBtn.value = axisBtn.value === 'time' ? 'category' : 'time'

  const columnDefs: ColDef[] = getColumnDefs()
  columnDefs.forEach(function (colDef) {
    if (colDef.field === 'date') {
      colDef.chartDataType = axisBtn.value
    }
  })

  gridApi!.setColumnDefs(columnDefs)
}

function formatDate(date: Date | number) {
  return Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: undefined }).format(new Date(date))
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
  const gridDiv = document.querySelector<HTMLElement>('#myGrid')!
  gridApi = createGrid(gridDiv, gridOptions);
})
