import type { GridApi, GridOptions } from 'ag-grid-community';
import { ClientSideRowModelModule, ModuleRegistry, ValidationModule, createGrid } from 'ag-grid-community';

import { LazyCellLoader } from './lazyCellComp_typescript';

// PLACEHOLDER MAIN FILE NOT ACTUALLY USED IN THE EXAMPLE AS REACT PROVIDED EXAMPLES ONLY
ModuleRegistry.registerModules([
    ClientSideRowModelModule,
    ...(process.env.NODE_ENV !== 'production' ? [ValidationModule] : []),
]);

let gridApi: GridApi<IOlympicData>;
const gridOptions: GridOptions<IOlympicData> = {
    columnDefs: [
        {
            field: 'athlete',
        },
        {
            field: 'country',
            headerName: 'Slow Renderer',
            cellRenderer: LazyCellLoader,
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
