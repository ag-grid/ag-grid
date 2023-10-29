import {
    ColDef,
    createGrid,
    FirstDataRenderedEvent,
    GridApi,
    GridOptions,
    GridReadyEvent
} from '@ag-grid-community/core';
import {getData} from './data';

const columnDefs: ColDef[] = [
    { field: 'country', width: 150, chartDataType: 'category' },
    { field: 'gold', chartDataType: 'series' },
    { field: 'silver', chartDataType: 'series' },
    { field: 'bronze', chartDataType: 'series' },
];

let gridApi: GridApi;

const gridOptions: GridOptions = {
    defaultColDef: { flex: 1 },
    columnDefs,
    popupParent: document.body,
    enableRangeSelection: true,
    enableCharts: true,
    chartToolPanelsDef: {
        defaultToolPanel: 'settings',
        settingsPanel: {
            chartGroupsDef: {
                pieGroup: ['doughnut', 'pie'],
                columnGroup: ['stackedColumn', 'column', 'normalizedColumn'],
                barGroup: ['bar'],
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
    params.api.createRangeChart({
        cellRange: {
            rowStartIndex: 0,
            rowEndIndex: 4,
            columns: ['country', 'gold', 'silver', 'bronze'],
        },
        chartType: 'groupedColumn',
    });
}

document.addEventListener('DOMContentLoaded', () => {
    gridApi = createGrid(document.querySelector<HTMLElement>('#myGrid')!, gridOptions);
});
