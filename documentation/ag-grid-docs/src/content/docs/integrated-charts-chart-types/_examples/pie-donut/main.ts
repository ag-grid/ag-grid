import {createGrid, FirstDataRenderedEvent, GridApi, GridOptions, GridReadyEvent, ChartRef} from '@ag-grid-community/core';
import {getData} from "./data";
import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import { GridChartsModule } from '@ag-grid-enterprise/charts-enterprise';
import { MenuModule } from '@ag-grid-enterprise/menu';
import { RowGroupingModule } from '@ag-grid-enterprise/row-grouping';
import { ModuleRegistry } from "@ag-grid-community/core";

ModuleRegistry.registerModules([ClientSideRowModelModule, GridChartsModule, MenuModule, RowGroupingModule]);


let gridApi: GridApi;
let chartRef: ChartRef;


const chartConfig: Record<'pie' | 'donut', { chartColumns: string[] }> = {
  pie: {
    chartColumns: ['period', 'individual'],
  },
  donut: {
    chartColumns: ['period', 'recurring', 'individual'],
  },
};

const gridOptions: GridOptions = {
  columnDefs: [
    { field: 'period', chartDataType: 'category', headerName: 'Financial Period', width: 150 },
    { field: 'recurring', chartDataType: 'series', headerName: 'Recurring revenue' },
    { field: 'individual', chartDataType: 'series', headerName: 'Individual sales' },
  ],
  defaultColDef: {
    flex: 1,
    minWidth: 100,
  },
  popupParent: document.body,
  enableRangeSelection: true,
  enableCharts: true,
  chartToolPanelsDef: {
    defaultToolPanel: 'settings'
  },
  onGridReady : (params: GridReadyEvent) => {
    getData().then(rowData => params.api.setGridOption('rowData', rowData));
  },
  onFirstDataRendered,
};

function onFirstDataRendered(params: FirstDataRenderedEvent) {
  const chartType = 'pie';
  chartRef = params.api.createRangeChart({
    chartContainer: document.querySelector('#myChart') as any,
    chartType,
    cellRange: {
      rowStartIndex: 0,
      rowEndIndex: 3,
      columns: chartConfig[chartType].chartColumns,
    },
  })!;
}

function updateChart(chartType: 'pie' | 'donut') {
  gridApi.updateChart({
    type: 'rangeChartUpdate',
    chartId: `${chartRef.chartId}`,
    chartType,
    cellRange: {
      rowStartIndex: 0,
      rowEndIndex: 3,
      columns: chartConfig[chartType].chartColumns,
    },
  });
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
  const gridDiv = document.querySelector<HTMLElement>('#myGrid')!
  gridApi = createGrid(gridDiv, gridOptions);
})