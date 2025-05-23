import type { ColDef, FilterEvaluator, GridApi, GridOptions } from 'ag-grid-community';
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

function yearFilterEvaluator(): FilterEvaluator<any, any, boolean> {
    return {
        doesFilterPass: ({ model, node, evaluatorParams }) => (model ? evaluatorParams.getValue(node) > 2010 : true),
    };
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
        filter: YearFilter,
        filterEvaluator: yearFilterEvaluator,
    },
    {
        field: 'year',
        headerName: 'Year Apply',
        minWidth: 130,
        filter: YearFilter,
        filterParams: {
            useForm: true,
            buttons: ['apply'],
            closeOnApply: true,
        },
        filterEvaluator: yearFilterEvaluator,
    },
    {
        field: 'year',
        headerName: 'Year Reset',
        minWidth: 130,
        filter: YearFilter,
        filterParams: {
            buttons: ['reset'],
        },
        filterEvaluator: yearFilterEvaluator,
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
    enableFilterEvaluators: true,
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
