import { Grid, ChartMenuOptions, ColDef, CreateRangeChartParams, FirstDataRenderedEvent, GridOptions, ValueFormatterParams } from '@ag-grid-community/core'

declare var moment: any;

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
  popupParent: document.body,
  rowData: getRowData(),
  enableRangeSelection: true,
  enableCharts: true,
  chartThemeOverrides: {
    line: {
      title: {
        enabled: true,
        text: 'Average Daily Temperatures',
      },
      legend: {
        enabled: false,
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
              return moment(new Date(params.value)).format('DD MMM')
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
              content: `${moment(xValue).format('DD MMM')}: ${Math.round(yValue)}°C`,
            };
          },
        },
      },
    },
  },
  chartToolPanelsDef: {
    panels: ['data', 'format']
  },
  getChartToolbarItems,
  onFirstDataRendered: onFirstDataRendered,
}

var currentChartRef: any;

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

function getChartToolbarItems(): ChartMenuOptions[] {
  return []
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

  gridOptions.api!.setColumnDefs(columnDefs)
}


function getRowData() {
  return [
    { date: new Date(2019, 0, 1), avgTemp: 8.27 },
    { date: new Date(2019, 0, 5), avgTemp: 7.22 },
    { date: new Date(2019, 0, 8), avgTemp: 11.54 },
    { date: new Date(2019, 0, 11), avgTemp: 8.44 },
    { date: new Date(2019, 0, 22), avgTemp: 12.03 },
    { date: new Date(2019, 0, 23), avgTemp: 9.68 },
    { date: new Date(2019, 0, 24), avgTemp: 9.9 },
    { date: new Date(2019, 0, 25), avgTemp: 8.74 },
  ]
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
  var gridDiv = document.querySelector<HTMLElement>('#myGrid')!
  new Grid(gridDiv, gridOptions)
})
