import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import { GridApi, GridOptions, createGrid } from '@ag-grid-community/core';
import { ModuleRegistry } from '@ag-grid-community/core';
import { ColumnsToolPanelModule } from '@ag-grid-enterprise/column-tool-panel';
import { MenuModule } from '@ag-grid-enterprise/menu';
import { RowGroupingModule } from '@ag-grid-enterprise/row-grouping';
import { SetFilterModule } from '@ag-grid-enterprise/set-filter';

import { getData } from './data';

ModuleRegistry.registerModules([
    ClientSideRowModelModule,
    ColumnsToolPanelModule,
    MenuModule,
    RowGroupingModule,
    SetFilterModule,
]);

let gridApi: GridApi;

const gridOptions: GridOptions = {
    columnDefs: [
        { field: 'athlete' },
        { field: 'country', rowGroup: true },
        { field: 'city', rowGroup: true },
        { field: 'year' },
        { field: 'gold', aggFunc: 'sum' },
        { field: 'silver', aggFunc: 'sum' },
        { field: 'bronze', aggFunc: 'sum' },
    ],
    defaultColDef: {
        flex: 1,
        minWidth: 150,
    },
    autoGroupColumnDef: {
        headerName: 'Group',
        field: 'athlete',
        minWidth: 220,
        cellRenderer: 'agGroupCellRenderer',
    },
    rowData: getData(),

    // optional as 'singleColumn' is the default group display type
    groupDisplayType: 'singleColumn',

    // set this to true to remove single children
    groupRemoveSingleChildren: false,

    // set this to true to remove leaf level single children
    groupRemoveLowestSingleChildren: false,

    // expand everything by default
    groupDefaultExpanded: -1,

    suppressAggFuncInHeader: true,
};

function changeSelection(type: string) {
    // normal, single or lowest
    if (type === 'normal') {
        gridApi!.updateGridOptions({ groupRemoveSingleChildren: false, groupRemoveLowestSingleChildren: false });
    } else if (type === 'single') {
        gridApi!.updateGridOptions({ groupRemoveSingleChildren: true, groupRemoveLowestSingleChildren: false });
    } else if (type === 'lowest') {
        gridApi!.updateGridOptions({ groupRemoveSingleChildren: false, groupRemoveLowestSingleChildren: true });
    } else {
        console.log('unknown type: ' + type);
    }
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    var gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);
});
