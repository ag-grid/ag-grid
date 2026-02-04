import type { ColDef, GridApi, GridOptions } from 'ag-grid-community';
import {
    BigIntFilterModule,
    ClientSideRowModelModule,
    ModuleRegistry,
    TextEditorModule,
    ValidationModule,
    createGrid,
} from 'ag-grid-community';

import { getData } from './data';

ModuleRegistry.registerModules([
    ClientSideRowModelModule,
    TextEditorModule,
    BigIntFilterModule,
    ...(process.env.NODE_ENV !== 'production' ? [ValidationModule] : []),
]);

const columnDefs: ColDef[] = [
    {
        field: 'ledgerId',
        headerName: 'Ledger ID (BigInt)',
        cellDataType: 'bigint',
        filter: true,
        minWidth: 190,
    },
    {
        field: 'balance',
        headerName: 'Balance (BigInt)',
        cellDataType: 'bigint',
        filter: 'agBigIntColumnFilter',
        minWidth: 190,
    },
    { field: 'account', minWidth: 150 },
];

let gridApi: GridApi;

const gridOptions: GridOptions = {
    columnDefs,
    defaultColDef: {
        flex: 1,
        minWidth: 140,
        editable: true,
    },
    rowData: getData(),
};

document.addEventListener('DOMContentLoaded', () => {
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);
});
