import {
    ChartMenuOptions,
    createGrid,
    CreateRangeChartParams,
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
    defaultColDef: {
        flex: 1,
    },
    popupParent: document.body,
    enableRangeSelection: true,
    enableCharts: true,
    getChartToolbarItems,
    onGridReady,
    onFirstDataRendered,
};

function getChartToolbarItems(): ChartMenuOptions[] {
    return ['chartDownload'];
}

function onGridReady(params: GridReadyEvent) {
    getData().then(rowData => params.api.setRowData(rowData));
}

function onFirstDataRendered(params: FirstDataRenderedEvent) {
    const createRangeChartParams: CreateRangeChartParams = {
        cellRange: {
            rowStartIndex: 0,
            rowEndIndex: 4,
            columns: ['country', 'gold', 'silver', 'bronze'],
        },
        chartType: 'groupedColumn'
    }

    params.api.createRangeChart(createRangeChartParams);
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    var gridDiv = document.querySelector<HTMLElement>('#myGrid')!
    gridApi = createGrid(gridDiv, gridOptions);
})
