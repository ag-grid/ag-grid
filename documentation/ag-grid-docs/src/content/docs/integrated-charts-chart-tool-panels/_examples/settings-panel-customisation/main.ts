import { ClientSideRowModelModule } from 'ag-grid-community';
import { FirstDataRenderedEvent, GridApi, GridOptions, GridReadyEvent, createGrid } from 'ag-grid-community';
import { ModuleRegistry } from 'ag-grid-community';
import { GridChartsModule } from 'ag-grid-enterprise';
import { MenuModule } from 'ag-grid-enterprise';
import { RowGroupingModule } from 'ag-grid-enterprise';

import { getData } from './data';

ModuleRegistry.registerModules([ClientSideRowModelModule, GridChartsModule, MenuModule, RowGroupingModule]);

let gridApi: GridApi;

const gridOptions: GridOptions = {
    columnDefs: [
        { field: 'country', chartDataType: 'category', width: 150 },
        { field: 'gold', chartDataType: 'series' },
        { field: 'silver', chartDataType: 'series' },
        { field: 'bronze', chartDataType: 'series' },
    ],
    defaultColDef: { flex: 1 },
    selection: { mode: 'cell' },
    popupParent: document.body,
    enableCharts: true,
    chartToolPanelsDef: {
        defaultToolPanel: 'settings',
        settingsPanel: {
            chartGroupsDef: {
                pieGroup: ['donut', 'pie'],
                columnGroup: ['stackedColumn', 'column', 'normalizedColumn'],
                barGroup: ['bar'],
            },
        },
    },
    onGridReady: (params: GridReadyEvent) => {
        getData().then((rowData) => params.api.setGridOption('rowData', rowData));
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
        chartType: 'groupedColumn',
    });
}

document.addEventListener('DOMContentLoaded', () => {
    gridApi = createGrid(document.querySelector<HTMLElement>('#myGrid')!, gridOptions);
});
