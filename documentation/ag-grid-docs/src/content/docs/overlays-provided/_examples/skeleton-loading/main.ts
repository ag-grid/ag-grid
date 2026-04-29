import type { GridApi, GridOptions } from 'ag-grid-community';
import { ClientSideRowModelModule, ModuleRegistry, ValidationModule, createGrid } from 'ag-grid-community';

ModuleRegistry.registerModules([
    ClientSideRowModelModule,
    ...(process.env.NODE_ENV !== 'production' ? [ValidationModule] : []),
]);

interface IAthlete {
    athlete: string;
    country: string;
}

let gridApi: GridApi<IAthlete>;

const gridOptions: GridOptions<IAthlete> = {
    columnDefs: [{ field: 'athlete' }, { field: 'country' }],
    skeletonRows: { rowCount: 5 },
};

function setLoading(value: boolean) {
    gridApi!.setGridOption('loading', value);
}

function onBtnSetRowData() {
    gridApi!.setGridOption('loading', false);
    gridApi!.setGridOption('rowData', [
        { athlete: 'Michael Phelps', country: 'United States' },
        { athlete: 'Usain Bolt', country: 'Jamaica' },
        { athlete: 'Simone Biles', country: 'United States' },
    ]);
}

function onBtnClearRowData() {
    gridApi!.setGridOption('rowData', undefined);
    gridApi!.setGridOption('loading', true);
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);
});
