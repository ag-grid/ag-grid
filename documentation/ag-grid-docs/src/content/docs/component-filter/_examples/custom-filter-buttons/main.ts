import type { ColDef, DoesFilterPassParams, GridApi, GridOptions } from 'ag-grid-community';
import {
    ClientSideRowModelModule,
    CustomFilterModule,
    ModuleRegistry,
    ValidationModule,
    createGrid,
} from 'ag-grid-community';

import { YearFilter } from './yearFilter_typescript';

ModuleRegistry.registerModules([
    CustomFilterModule,
    ClientSideRowModelModule,
    ...(process.env.NODE_ENV !== 'production' ? [ValidationModule] : []),
]);

function doesFilterPass({ model, node, handlerParams }: DoesFilterPassParams<any, any, boolean>): boolean {
    return model ? handlerParams.getValue(node) > 2010 : true;
}

const columnDefs: ColDef[] = [
    {
        field: 'athlete',
        minWidth: 150,
    },
    {
        field: 'year',
        headerName: 'Year Default',
        minWidth: 130,
        filter: { component: YearFilter, doesFilterPass: doesFilterPass },
    },
    {
        field: 'year',
        headerName: 'Year Apply',
        minWidth: 130,
        filter: { component: YearFilter, doesFilterPass: doesFilterPass },
        filterParams: {
            useForm: true,
            buttons: ['apply'],
            closeOnApply: true,
        },
    },
    {
        field: 'year',
        headerName: 'Year Reset',
        minWidth: 130,
        filter: { component: YearFilter, doesFilterPass: doesFilterPass },
        filterParams: {
            buttons: ['reset'],
        },
    },
    { field: 'sport' },
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
