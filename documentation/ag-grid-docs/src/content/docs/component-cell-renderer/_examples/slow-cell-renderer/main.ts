import type { GridApi, GridOptions } from 'ag-grid-community';
import { ClientSideRowModelModule, ModuleRegistry, ValidationModule, createGrid } from 'ag-grid-community';

import { CustomLoadingCellRenderer } from './customLoadingCellRenderer_typescript';
import { FastRenderer } from './fastRenderer_typescript';
import { SlowRenderer } from './slowRenderer_typescript';

ModuleRegistry.registerModules([
    ClientSideRowModelModule,
    ...(process.env.NODE_ENV !== 'production' ? [ValidationModule] : []),
]);

let gridApi: GridApi<IOlympicData>;

const gridOptions: GridOptions<IOlympicData> = {
    rowBuffer: 5, // Reduce the row buffer to reduce number of slow cells to be rendered
    columnDefs: [
        {
            field: 'athlete',
        },
        {
            field: 'country',
            headerName: 'Slow Renderer',
            cellRenderer: SlowRenderer,
            cellRendererParams: {
                deferRender: true,
            },
        },
        {
            field: 'bronze',
            headerName: 'Slow Renderer Custom Loading',
            cellRenderer: SlowRenderer,
            cellRendererParams: {
                deferRender: true,
            },
            loadingCellRenderer: CustomLoadingCellRenderer,
        },
        {
            field: 'gold',
            headerName: 'Fast Renderer',
            cellRenderer: FastRenderer,
        },
        {
            field: 'sport',
        },
    ],
    defaultColDef: {
        flex: 1,
        autoHeaderHeight: true,
        wrapHeaderText: true,
    },
};

document.addEventListener('DOMContentLoaded', () => {
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);

    fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
        .then((response) => response.json())
        .then((data) => {
            gridApi!.setGridOption('rowData', data);
        });
});
