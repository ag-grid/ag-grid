import type { ColDef, GridApi, GridOptions, GridState } from 'ag-grid-community';
import {
    BigIntFilterModule,
    ClientSideRowModelModule,
    GridStateModule,
    ModuleRegistry,
    ValidationModule,
    createGrid,
} from 'ag-grid-community';
import {
    ColumnsToolPanelModule,
    FiltersToolPanelModule,
    PivotModule,
    RowGroupingModule,
    SetFilterModule,
    SideBarModule,
} from 'ag-grid-enterprise';

import { getData } from './data';

ModuleRegistry.registerModules([
    BigIntFilterModule,
    GridStateModule,
    ClientSideRowModelModule,
    SideBarModule,
    ColumnsToolPanelModule,
    FiltersToolPanelModule,
    RowGroupingModule,
    PivotModule,
    SetFilterModule,
    ...(process.env.NODE_ENV !== 'production' ? [ValidationModule] : []),
]);

const columnDefs: ColDef[] = [
    { field: 'region', rowGroup: true, minWidth: 140 },
    { field: 'account', minWidth: 160 },
    { field: 'category', pivot: true, minWidth: 140 },
    {
        field: 'totalBigInt',
        headerName: 'Total (BigInt)',
        cellDataType: 'bigint',
        filter: 'agBigIntColumnFilter',
        aggFunc: 'sum',
        minWidth: 180,
    },
    {
        field: 'transactionsBigInt',
        headerName: 'Transactions (BigInt)',
        cellDataType: 'bigint',
        filter: 'agBigIntColumnFilter',
        aggFunc: 'sum',
        minWidth: 200,
    },
];

let gridApi: GridApi;
let savedState: GridState | undefined;

const gridOptions: GridOptions = {
    columnDefs,
    defaultColDef: {
        flex: 1,
        minWidth: 120,
        sortable: true,
        filter: true,
        enableRowGroup: true,
        enablePivot: true,
        enableValue: true,
        editable: true,
    },
    autoGroupColumnDef: {
        minWidth: 200,
    },
    pivotMode: true,
    sideBar: {
        toolPanels: ['columns', 'filters'],
        defaultToolPanel: '',
    },
    rowData: getData(),
};

function saveState() {
    savedState = gridApi.getState();
    console.log('Saved state', savedState);
}

function restoreState() {
    if (savedState) {
        gridApi.setState(savedState);
        console.log('Restored state', savedState);
    }
}

function clearState() {
    savedState = undefined;
    gridApi.setState({});
    console.log('Cleared state');
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', () => {
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);

    (window as any).saveState = saveState;
    (window as any).restoreState = restoreState;
    (window as any).clearState = clearState;
});
