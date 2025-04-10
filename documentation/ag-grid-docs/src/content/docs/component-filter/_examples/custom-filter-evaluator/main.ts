import type { ColDef, FilterEvaluator, GridApi, GridOptions } from 'ag-grid-community';
import {
    ClientSideRowModelModule,
    CustomFilterModule,
    ModuleRegistry,
    ValidationModule,
    createGrid,
} from 'ag-grid-community';

import { PersonFilter } from './personFilter_typescript';
import { YearFilter } from './yearFilter_typescript';

ModuleRegistry.registerModules([
    CustomFilterModule,
    ClientSideRowModelModule,
    ...(process.env.NODE_ENV !== 'production' ? [ValidationModule] : []),
]);

function personFilterEvaluator(): FilterEvaluator<any, any, string> {
    return {
        doesFilterPass: (params) => {
            const { data, model } = params;
            // make sure each word passes separately, ie search for firstname, lastname
            let passed = true;
            model
                ?.toLowerCase()
                .split(' ')
                .forEach((filterWord) => {
                    const value = data.athlete;
                    if (value.toString().toLowerCase().indexOf(filterWord) < 0) {
                        passed = false;
                    }
                });

            return passed;
        },
    };
}

function yearFilterEvaluator(): FilterEvaluator<any, any, boolean> {
    return {
        doesFilterPass: (params) => params.data.year >= 2010,
    };
}

const columnDefs: ColDef[] = [
    {
        field: 'athlete',
        minWidth: 150,
        filter: PersonFilter,
        filterEvaluator: personFilterEvaluator,
    },
    {
        field: 'year',
        minWidth: 130,
        filter: YearFilter,
        filterParams: {
            useForm: true,
            buttons: ['apply'],
            closeOnApply: true,
        },
        filterEvaluator: yearFilterEvaluator,
    },
    { field: 'country', minWidth: 150 },
    { field: 'sport' },
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
