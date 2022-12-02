import { Grid, ChartType, ColDef, CreateRangeChartParams, GetRowIdParams, GridOptions, ValueFormatterParams, ChartMenuOptions } from '@ag-grid-community/core'
import { AgAxisLabelFormatterParams, AgCartesianSeriesTooltipRendererParams } from 'ag-charts-community';
declare var __basePath: string;

const columnDefs: ColDef[] = [
  { field: 'product', chartDataType: 'category' },
  { field: 'book', chartDataType: 'category' },

  { field: 'current', type: 'measure' },
  { field: 'previous', type: 'measure' },
  { headerName: 'PL 1', field: 'pl1', type: 'measure' },
  { headerName: 'PL 2', field: 'pl2', type: 'measure' },
  { headerName: 'Gain-DX', field: 'gainDx', type: 'measure' },
  { headerName: 'SX / PX', field: 'sxPx', type: 'measure' },

  { field: 'trade', type: 'measure' },
  { field: 'submitterID', type: 'measure' },
  { field: 'submitterDealID', type: 'measure', minWidth: 170 },

  { field: 'portfolio' },
  { field: 'dealType' },
  { headerName: 'Bid', field: 'bidFlag' },
]

var chartRef: any;

const gridOptions: GridOptions = {
  columnDefs: columnDefs,
  defaultColDef: {
    editable: true,
    sortable: true,
    flex: 1,
    minWidth: 150,
    filter: true,
    resizable: true,
  },
  columnTypes: {
    measure: {
      chartDataType: 'series',
      cellClass: 'number',
      valueFormatter: numberCellFormatter,
      cellRenderer: 'agAnimateShowChangeCellRenderer',
    },
  },
  animateRows: true,
  enableCharts: true,
  suppressAggFuncInHeader: true,
  getRowId: (params: GetRowIdParams) => {
    return params.data.trade
  },
  onFirstDataRendered: (params) => {
    var createRangeChartParams: CreateRangeChartParams = {
      cellRange: {
        columns: [
          'product',
          'current',
          'previous',
          'pl1',
          'pl2',
          'gainDx',
          'sxPx',
        ]
      },
      chartType: 'groupedColumn',
      chartContainer: document.querySelector('#myChart') as any,
      suppressChartRanges: true,
      aggFunc: 'sum',
    }

    chartRef = params.api.createRangeChart(createRangeChartParams)
  },
  chartThemes: ['ag-pastel-dark'],
  chartThemeOverrides: {
    common: {
      legend: {
        position: 'bottom',
      },
    },
    column: {
      axes: {
        number: {
          label: {
            formatter: yAxisLabelFormatter,
          },
        },
        category: {
          label: {
            rotation: 0,
          },
        },
      },
      series: {
        tooltip: {
          renderer: tooltipRenderer,
        },
      },
    },
    line: {
      series: {
        tooltip: {
          renderer: tooltipRenderer,
        },
      },
    },
  },
  getChartToolbarItems: function (): ChartMenuOptions[] {
    return [] // hide toolbar items
  },
}

function createChart(type: ChartType) {
  // destroy existing chart
  if (chartRef) {
    chartRef.destroyChart()
  }

  var params: CreateRangeChartParams = {
    cellRange: {
      columns: [
        'product',
        'current',
        'previous',
        'pl1',
        'pl2',
        'gainDx',
        'sxPx',
      ]
    },
    chartContainer: document.querySelector('#myChart') as any,
    chartType: type,
    suppressChartRanges: true,
    aggFunc: 'sum',
  }

  chartRef = gridOptions.api!.createRangeChart(params)
}

function numberCellFormatter(params: ValueFormatterParams) {
  return Math.floor(params.value)
    .toString()
    .replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')
}

function yAxisLabelFormatter(params: AgAxisLabelFormatterParams) {
  var n = params.value
  if (n < 1e3) return n
  if (n >= 1e3 && n < 1e6) return +(n / 1e3).toFixed(1) + 'K'
  if (n >= 1e6 && n < 1e9) return +(n / 1e6).toFixed(1) + 'M'
  if (n >= 1e9 && n < 1e12) return +(n / 1e9).toFixed(1) + 'B'
  if (n >= 1e12) return +(n / 1e12).toFixed(1) + 'T'
}

function tooltipRenderer(params: AgCartesianSeriesTooltipRendererParams) {
  var value =
    '$' +
    params.datum[params.yKey]
      .toString()
      .replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')
  var title = params.title || params.yName
  return '<div style="padding: 5px"><b>' + title + '</b>: ' + value + '</div>'
}

// after page is loaded, create the grid
document.addEventListener('DOMContentLoaded', function () {
  var eGridDiv = document.querySelector<HTMLElement>('#myGrid')!
  new Grid(eGridDiv, gridOptions)
})

var worker: any;
(function startWorker() {
  worker = new Worker(__basePath + 'dataUpdateWorker.js')
  worker.onmessage = function (e: any) {
    if (e.data.type === 'setRowData') {
      gridOptions.api!.setRowData(e.data.records)
    }
    if (e.data.type === 'updateData') {
      gridOptions.api!.applyTransactionAsync({ update: e.data.records })
    }
  }

  worker.postMessage('start')
})()

function onStartLoad() {
  worker.postMessage('start')
}

function onStopMessages() {
  worker.postMessage('stop')
}
