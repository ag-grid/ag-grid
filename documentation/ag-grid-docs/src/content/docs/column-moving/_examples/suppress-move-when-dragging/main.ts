import type { GridApi, GridOptions } from 'ag-grid-community';
import { ClientSideRowModelModule, ModuleRegistry, ValidationModule, createGrid } from 'ag-grid-community';

ModuleRegistry.registerModules([
    ClientSideRowModelModule,
    ...(process.env.NODE_ENV !== 'production' ? [ValidationModule] : []),
]);

let gridApi: GridApi<IOlympicData>;

const gridOptions: GridOptions<IOlympicData> = {
    columnDefs: [
        {
            headerName: 'Athlete Info',
            children: [{ field: 'athlete' }, { field: 'age' }, { field: 'country' }],
        },
        {
            headerName: 'Event',
            children: [{ field: 'year' }, { field: 'date' }, { field: 'sport' }],
        },
        {
            headerName: 'Medals',
            children: [{ field: 'gold' }, { field: 'silver' }, { field: 'bronze' }, { field: 'total' }],
        },
    ],
    defaultColDef: {
        width: 150,
    },
    suppressDragLeaveHidesColumns: true,
    suppressMoveWhenColumnDragging: true,
};

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', () => {
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);

    fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
        .then((response) => response.json())
        .then((data: IOlympicData[]) => gridApi!.setGridOption('rowData', data));
});
