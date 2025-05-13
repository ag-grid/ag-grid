import type { GridApi, GridOptions } from 'ag-grid-community';
import {
    CellStyleModule,
    ClientSideRowModelModule,
    ModuleRegistry,
    ValidationModule,
    createGrid,
} from 'ag-grid-community';

import { getRowData } from './data';

ModuleRegistry.registerModules([
    ClientSideRowModelModule,
    CellStyleModule,
    ...(process.env.NODE_ENV !== 'production' ? [ValidationModule] : []),
]);

let gridApi: GridApi;

const gridOptions: GridOptions = {
    columnDefs: [
        {
            field: 'latinText',
            width: 180,
            headerName: 'Default Behaviour',
        },
        {
            field: 'latinText',
            width: 180,
            wrapText: true,
            headerName: 'wrapText = true',
        },
        {
            headerName: 'Configured via CSS',
            children: [
                {
                    field: 'latinText',
                    width: 180,
                    cellStyle: { 'white-space': 'normal' },
                    headerName: 'Wrap Text',
                },
                {
                    field: 'latinText',
                    width: 180,
                    cellStyle: { 'white-space-collapse': 'preserve-breaks' },
                    headerName: 'Maintain New Lines',
                },
                {
                    field: 'latinText',
                    width: 205,
                    cellStyle: { 'white-space': 'pre-line' },
                    headerName: 'Wrap with New Lines',
                },
            ],
        },
    ],
    rowHeight: 120,
    rowData: getRowData(),
};

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);
});
