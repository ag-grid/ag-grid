import {
    ChartMenuOptions,
    createGrid,
    FirstDataRenderedEvent,
    GridApi,
    GridOptions,
    GridReadyEvent
} from '@ag-grid-community/core';
import {getData} from "./data";

let gridApi: GridApi;

const gridOptions: GridOptions = {
    columnDefs: [
        {field: 'country', width: 150, chartDataType: 'category'},
        {field: 'gold', chartDataType: 'series'},
        {field: 'silver', chartDataType: 'series'},
        {field: 'bronze', chartDataType: 'series'},
    ],
    defaultColDef: {flex: 1},
    enableRangeSelection: true,
    popupParent: document.body,
    enableCharts: true,
    getChartToolbarItems,
    onGridReady : (params: GridReadyEvent) => {
    getData().then(rowData => params.api.setGridOption('rowData', rowData));
  },
    onFirstDataRendered,
};

function getChartToolbarItems(): ChartMenuOptions[] {
    return ['chartDownload'];
}

function onFirstDataRendered(params: FirstDataRenderedEvent) {
    params.api.createRangeChart({
        cellRange: {
            rowStartIndex: 0,
            rowEndIndex: 4,
            columns: ['country', 'gold', 'silver', 'bronze'],
        },
        chartType: 'groupedColumn'
    });
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!
    gridApi = createGrid(gridDiv, gridOptions);
})
