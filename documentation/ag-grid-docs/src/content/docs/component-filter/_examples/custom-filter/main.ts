import type { ColDef, DoesFilterPassParams, GridApi, GridOptions } from 'ag-grid-community';
import {
    ClientSideRowModelModule,
    CustomFilterModule,
    ModuleRegistry,
    ValidationModule,
    createGrid,
} from 'ag-grid-community';

import { PersonFilter } from './personFilter_typescript';

ModuleRegistry.registerModules([
    CustomFilterModule,
    ClientSideRowModelModule,
    ...(process.env.NODE_ENV !== 'production' ? [ValidationModule] : []),
]);

function doesFilterPass({ model, node, handlerParams }: DoesFilterPassParams<any, any, string>): boolean {
    // make sure each word passes separately, ie search for firstname, lastname
    let passed = true;
    model
        .toLowerCase()
        .split(' ')
        .forEach((filterWord) => {
            const value = handlerParams.getValue(node);
            if (value.toString().toLowerCase().indexOf(filterWord) < 0) {
                passed = false;
            }
        });

    return passed;
}

const columnDefs: ColDef[] = [
    {
        field: 'athlete',
        minWidth: 150,
        filter: { component: PersonFilter, doesFilterPass },
    },
    { field: 'country', minWidth: 150 },
    { field: 'sport' },
    { field: 'year', minWidth: 130 },
    { field: 'gold' },
    { field: 'silver' },
    { field: 'bronze' },
    { field: 'total' },
];

let gridApi: GridApi<IOlympicData>;

const gridOptions: GridOptions<IOlympicData> = {
    defaultColDef: {
        flex: 1,
        minWidth: 100,
    },
    columnDefs: columnDefs,
    enableFilterHandlers: true,
};

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', () => {
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);

    fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
        .then((response) => response.json())
        .then((data) => {
            gridApi!.setGridOption('rowData', data);
        });
});
