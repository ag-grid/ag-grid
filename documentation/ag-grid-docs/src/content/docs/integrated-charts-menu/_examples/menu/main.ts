import {
    createGrid,
    FirstDataRenderedEvent,
    GridApi,
    GridOptions,
    GridReadyEvent
} from '@ag-grid-community/core';
import {getData} from "./data";
import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import { GridChartsModule } from '@ag-grid-enterprise/charts-enterprise';
import { MenuModule } from '@ag-grid-enterprise/menu';
import { ModuleRegistry } from "@ag-grid-community/core";

ModuleRegistry.registerModules([ClientSideRowModelModule, GridChartsModule, MenuModule]);

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
    onGridReady : (params: GridReadyEvent) => {
    getData().then(rowData => params.api.setGridOption('rowData', rowData));
  },
    onFirstDataRendered,
};

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