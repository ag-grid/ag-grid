import {
  GridApi,
  createGrid,
  CreateRangeChartParams,
  FirstDataRenderedEvent,
  GridOptions,
  ChartRef
} from '@ag-grid-community/core';

let gridApi: GridApi;

const gridOptions: GridOptions = {
  columnDefs: [
    // different ways to define 'categories'
    { field: 'athlete', width: 150, chartDataType: 'category' },
    { field: 'age', chartDataType: 'category', sort: 'asc' },
    { field: 'sport' }, // inferred as category by grid

    // excludes year from charts
    { field: 'year', chartDataType: 'excluded' },

    // different ways to define 'series'
    { field: 'gold', chartDataType: 'series' },
    { field: 'silver', chartDataType: 'series' },
    { field: 'bronze' }, // inferred as series by grid
  ],
  defaultColDef: {
    editable: true,
    sortable: true,
    flex: 1,
    minWidth: 100,
    filter: true,
    resizable: true,
  },
  popupParent: document.body,
  enableRangeSelection: true,
  enableCharts: true,
  chartThemes: ['ag-default', 'ag-default-dark'],
  chartThemeOverrides: {
    common: {
      title: {
        enabled: true,
        text: 'Medals by Age',
      },
    },
    bar: {
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
  var createRangeChartParams: CreateRangeChartParams = {
    cellRange: {
      rowStartIndex: 0,
      rowEndIndex: 79,
      columns: ['age', 'gold', 'silver', 'bronze'],
    },
    chartType: 'groupedColumn',
    chartContainer: document.querySelector('#myChart') as any,
    aggFunc: 'sum',
  }

  const chart = params.api.createRangeChart(createRangeChartParams)!;

  toggleDarkMode(chart);
  document.addEventListener('color-scheme-change', (e: any) => {
    toggleDarkMode(chart, e.detail.darkMode);
  });
}

function toggleDarkMode(chart: ChartRef, darkMode?: boolean) {
  const gridDiv = document.querySelector<HTMLElement>('#myGrid')!

  if (darkMode == null) {
    darkMode = false;

    for (const cls of gridDiv.classList.values()) {
      if (cls.indexOf('dark') !== -1) { darkMode = true; break; }
    }
  }

  changeChartTheme(darkMode, chart);
}

function changeChartTheme(darkMode: boolean, chart: ChartRef) {
  gridApi.updateChart({
    type: 'rangeChartUpdate',
    chartId: chart!.chartId,
    chartThemeName: darkMode ? 'ag-default-dark' : 'ag-default',
  });
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
  var gridDiv = document.querySelector<HTMLElement>('#myGrid')!
  gridApi = createGrid(gridDiv, gridOptions);

  fetch('https://www.ag-grid.com/example-assets/wide-spread-of-sports.json')
    .then(response => response.json())
    .then(function (data) {
      gridApi!.setRowData(data)
    })
})
