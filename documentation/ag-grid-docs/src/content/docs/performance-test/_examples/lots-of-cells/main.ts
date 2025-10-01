import type { ColDef, GridApi, GridOptions } from 'ag-grid-community';
import { ModuleRegistry, ValidationModule, createGrid } from 'ag-grid-community';
import { AllEnterpriseModule } from 'ag-grid-enterprise';

// Fallback for Safari and other browsers that do not support requestIdleCallback
const _requestIdleCallback = window.requestIdleCallback ?? setTimeout;

ModuleRegistry.registerModules([
    AllEnterpriseModule,
    ...(process.env.NODE_ENV !== 'production' ? [ValidationModule] : []),
]);

const repeat = (arr: any[], n: number) => Array(n).fill(arr).flat();

const cols: ColDef[] = [
    { field: 'athlete' },
    { field: 'gold' },
    { field: 'silver' },
    { field: 'bronze' },
    { field: 'total' },
    { field: 'age' },
    { field: 'country' },
    { field: 'sport' },
    { field: 'year' },
    { field: 'date' },
];

let gridApi: GridApi<IOlympicData>;

const gridOptions: GridOptions<IOlympicData> = {
    columnDefs: [],
    suppressColumnVirtualisation: true,
    rowBuffer: 300,
    defaultColDef: {
        initialWidth: 100,
    },
    rowData: [],
};

function outputText(time?: number) {
    const text = `Time taken: ${time ? Math.round(time) + 'ms' : ''}`;
    console.log(text);
    document.querySelector<HTMLElement>('#output')!.innerText = text;
}

function onClearData() {
    const start = performance.now();
    outputText();
    _requestIdleCallback(() => {
        outputText(Math.round(performance.now() - start));
    });
    gridApi!.updateGridOptions({
        columnDefs: [],
        rowData: [],
    });
}

function onSetData() {
    const start = performance.now();
    outputText();
    _requestIdleCallback(() => {
        outputText(performance.now() - start);
    });
    gridApi!.updateGridOptions({
        columnDefs: repeat(cols, 10),
        rowData: repeat(data, 100),
    });
}

function onScroll() {
    const start = performance.now();
    outputText();
    _requestIdleCallback(() => {
        outputText(performance.now() - start);
    });
    const eBodyViewport = document.querySelector<HTMLElement>('.ag-body-viewport')!;
    const currScroll = eBodyViewport.scrollTop;
    eBodyViewport.scroll(0, currScroll! + 5000);
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', () => {
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);
});

const data: IOlympicData[] = [
    {
        athlete: 'Michael Phelps',
        age: 23,
        country: 'United States',
        sport: 'Swimming',
        year: 2008,
        date: '24/08/2008',
        gold: 8,
        silver: 0,
        bronze: 0,
        total: 8,
    },
    {
        athlete: 'Michael Phelps',
        age: 19,
        country: 'United States',
        sport: 'Swimming',
        year: 2004,
        date: '29/08/2004',
        gold: 6,
        silver: 0,
        bronze: 2,
        total: 8,
    },
    {
        athlete: 'Michael Phelps',
        age: 27,
        country: 'United States',
        sport: 'Swimming',
        year: 2012,
        date: '12/08/2012',
        gold: 4,
        silver: 2,
        bronze: 0,
        total: 6,
    },
    {
        athlete: 'Natalie Coughlin',
        age: 25,
        country: 'United States',
        sport: 'Swimming',
        year: 2008,
        date: '24/08/2008',
        gold: 1,
        silver: 2,
        bronze: 3,
        total: 6,
    },
    {
        athlete: 'Aleksey Nemov',
        age: 24,
        country: 'Russia',
        sport: 'Gymnastics',
        year: 2000,
        date: '01/10/2000',
        gold: 2,
        silver: 1,
        bronze: 3,
        total: 6,
    },
    {
        athlete: 'Alicia Coutts',
        age: 24,
        country: 'Australia',
        sport: 'Swimming',
        year: 2012,
        date: '12/08/2012',
        gold: 1,
        silver: 3,
        bronze: 1,
        total: 5,
    },
    {
        athlete: 'Missy Franklin',
        age: 17,
        country: 'United States',
        sport: 'Swimming',
        year: 2012,
        date: '12/08/2012',
        gold: 4,
        silver: 0,
        bronze: 1,
        total: 5,
    },
    {
        athlete: 'Ryan Lochte',
        age: 27,
        country: 'United States',
        sport: 'Swimming',
        year: 2012,
        date: '12/08/2012',
        gold: 2,
        silver: 2,
        bronze: 1,
        total: 5,
    },
    {
        athlete: 'Allison Schmitt',
        age: 22,
        country: 'United States',
        sport: 'Swimming',
        year: 2012,
        date: '12/08/2012',
        gold: 3,
        silver: 1,
        bronze: 1,
        total: 5,
    },
];
