import type { ColDef, DoesFilterPassParams, GridApi, GridOptions } from 'ag-grid-community';
import {
    ClientSideRowModelModule,
    CustomFilterModule,
    ModuleRegistry,
    ValidationModule,
    createGrid,
} from 'ag-grid-community';

import { NumberFilterComponent } from './numberFilterComponent_typescript';
import { NumberFloatingFilterComponent } from './numberFloatingFilterComponent_typescript';

ModuleRegistry.registerModules([
    ClientSideRowModelModule,
    CustomFilterModule,
    ...(process.env.NODE_ENV !== 'production' ? [ValidationModule] : []),
]);

function doesFilterPass({ node, model, handlerParams }: DoesFilterPassParams<any, any, number>): boolean {
    const value = handlerParams.getValue(node);

    if (value == null) {
        return true;
    }

    return value > model;
}

const columnDefs: ColDef[] = [
    { field: 'athlete' },
    {
        field: 'gold',
        floatingFilterComponent: NumberFloatingFilterComponent,
        floatingFilterComponentParams: {
            color: 'gold',
        },
        filter: { component: NumberFilterComponent, doesFilterPass: doesFilterPass },
        suppressFloatingFilterButton: true,
    },
    {
        field: 'silver',
        floatingFilterComponent: NumberFloatingFilterComponent,
        floatingFilterComponentParams: {
            color: 'silver',
        },
        filter: { component: NumberFilterComponent, doesFilterPass: doesFilterPass },
        suppressFloatingFilterButton: true,
    },
    {
        field: 'bronze',
        floatingFilterComponent: NumberFloatingFilterComponent,
        floatingFilterComponentParams: {
            color: '#CD7F32',
        },
        filter: { component: NumberFilterComponent, doesFilterPass: doesFilterPass },
        suppressFloatingFilterButton: true,
    },
    {
        field: 'total',
        floatingFilterComponent: NumberFloatingFilterComponent,
        floatingFilterComponentParams: {
            color: 'unset',
        },
        filter: { component: NumberFilterComponent, doesFilterPass: doesFilterPass },
        suppressFloatingFilterButton: true,
    },
];

let gridApi: GridApi<IOlympicData>;

const gridOptions: GridOptions<IOlympicData> = {
    defaultColDef: {
        flex: 1,
        minWidth: 100,
        floatingFilter: true,
    },
    columnDefs,
    rowData: null,
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
