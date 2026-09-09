import type { GridApi, GridOptions } from 'ag-grid-community';
import { ClientSideRowModelModule, ModuleRegistry, createGrid, enableDevValidations } from 'ag-grid-community';

if (process.env.NODE_ENV !== 'production') {
    enableDevValidations();
}

ModuleRegistry.registerModules([ClientSideRowModelModule]);

interface IAthlete {
    athlete: string;
    country: string;
    sport: string;
    year: number;
    gold: number;
    silver: number;
    bronze: number;
}

let gridApi: GridApi<IAthlete>;

const rowData: IAthlete[] = [
    {
        athlete: 'Michael Phelps',
        country: 'United States',
        sport: 'Swimming',
        year: 2008,
        gold: 8,
        silver: 0,
        bronze: 0,
    },
    {
        athlete: 'Natalie Coughlin',
        country: 'United States',
        sport: 'Swimming',
        year: 2008,
        gold: 1,
        silver: 2,
        bronze: 3,
    },
    { athlete: 'Aleksey Nemov', country: 'Russia', sport: 'Gymnastics', year: 2000, gold: 2, silver: 1, bronze: 3 },
    { athlete: 'Alicia Coutts', country: 'Australia', sport: 'Swimming', year: 2012, gold: 1, silver: 3, bronze: 1 },
    {
        athlete: 'Missy Franklin',
        country: 'United States',
        sport: 'Swimming',
        year: 2012,
        gold: 4,
        silver: 0,
        bronze: 1,
    },
    { athlete: 'Ryan Lochte', country: 'United States', sport: 'Swimming', year: 2012, gold: 2, silver: 2, bronze: 1 },
    { athlete: 'Chris Hoy', country: 'Great Britain', sport: 'Cycling', year: 2008, gold: 3, silver: 0, bronze: 0 },
    { athlete: 'Ian Thorpe', country: 'Australia', sport: 'Swimming', year: 2000, gold: 3, silver: 2, bronze: 0 },
];

const gridOptions: GridOptions<IAthlete> = {
    loading: true,
    loadingRows: { rowCount: 10 },
    rowData,
    columnDefs: [
        { field: 'athlete' },
        { field: 'country' },
        { field: 'sport' },
        { field: 'year' },
        { field: 'gold' },
        { field: 'silver' },
        { field: 'bronze' },
    ],
};

function onLoadingToggled() {
    const loading = document.querySelector<HTMLInputElement>('#loading-toggle')!.checked;
    gridApi.setGridOption('loading', loading);
}

function onRowCountChanged() {
    const rowCount = document.querySelector<HTMLInputElement>('#row-count')!.valueAsNumber;
    if (!Number.isInteger(rowCount) || rowCount < 1) {
        return;
    }
    gridApi.setGridOption('loadingRows', { rowCount });
}

document.addEventListener('DOMContentLoaded', () => {
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);
});
