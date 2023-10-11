import { FirstDataRenderedEvent, GridApi, createGrid, GridOptions } from '@ag-grid-community/core';
import { getData } from "./data";


let gridApi: GridApi;


const gridOptions: GridOptions = {
  columnDefs: [
    { field: 'salesRep', chartDataType: 'category' },
    { field: 'handset', chartDataType: 'category' },
    {
      headerName: 'Sale Price',
      field: 'sale',
      maxWidth: 160,
      aggFunc: 'sum',
      filter: 'agNumberColumnFilter',
      chartDataType: 'series',
    },
    { field: 'saleDate', chartDataType: 'category' },
    {
      field: 'quarter',
      maxWidth: 160,
      filter: 'agSetColumnFilter',
      chartDataType: 'category',
    },
  ],
  defaultColDef: {
    flex: 1,
    editable: true,
    sortable: true,
    filter: 'agMultiColumnFilter',
    floatingFilter: true,
    resizable: true,
  },
  rowData: getData(),
  enableCharts: true,
  chartThemes: ['ag-default-dark'],
  chartThemeOverrides: {
    cartesian: {
      axes: {
        category: {
          label: {
            rotation: 0,
          },
        },
      },
    },
  },
  onFirstDataRendered: onFirstDataRendered,
}

function onFirstDataRendered(params: FirstDataRenderedEvent) {
  createQuarterlySalesChart(params.api)
  createSalesByRefChart(params.api)
  createHandsetSalesChart(params.api)
}

function createQuarterlySalesChart(api: GridApi) {
  api.createCrossFilterChart({
    chartType: 'line',
    cellRange: {
      columns: ['quarter', 'sale'],
    },
    aggFunc: 'sum',
    chartThemeOverrides: {
      common: {
        title: {
          enabled: true,
          text: 'Quarterly Sales ($)',
        },
        axes: {
          category: {
            label: {
              rotation: 0,
            },
          },
          number: {
            label: {
              formatter: (params: any) => {
                return params.value / 1000 + 'k'
              },
            },
          },
        },
      },
    },
    chartContainer: document.querySelector('#lineChart') as any,
  })
}

function createSalesByRefChart(api: GridApi) {
  api.createCrossFilterChart({
    chartType: 'doughnut',
    cellRange: {
      columns: ['salesRep', 'sale'],
    },
    aggFunc: 'sum',
    chartThemeOverrides: {
      common: {
        title: {
          enabled: true,
          text: 'Sales by Representative ($)',
        },
      },
      pie: {
        legend: {
          position: 'right',
        },
        series: {
          title: {
            enabled: false,
          },
          calloutLabel: {
            enabled: false,
          },
        },
      },
    },
    chartContainer: document.querySelector('#doughnutChart') as any,
  })
}

function createHandsetSalesChart(api: GridApi) {
  api.createCrossFilterChart({
    chartType: 'area',
    cellRange: {
      columns: ['handset', 'sale'],
    },
    aggFunc: 'count',
    chartThemeOverrides: {
      common: {
        title: {
          enabled: true,
          text: 'Handsets Sold (Units)',
        },
      }
    },
    chartContainer: document.querySelector('#areaChart') as any,
  })
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
  var gridDiv = document.querySelector<HTMLElement>('#myGrid')!
  gridApi = createGrid(gridDiv, gridOptions);;
})
