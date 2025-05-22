import type { ColDef, FilterEvaluator, GridApi, GridOptions } from 'ag-grid-community';
import {
    ClientSideRowModelModule,
    CustomFilterModule,
    ModuleRegistry,
    ValidationModule,
    createGrid,
} from 'ag-grid-community';

import { NumberFilterComponent } from './numberFilterComponent_typescript';

ModuleRegistry.registerModules([
    CustomFilterModule,
    ClientSideRowModelModule,
    ...(process.env.NODE_ENV !== 'production' ? [ValidationModule] : []),
]);

function numberFilterEvaluator(): FilterEvaluator {
    return {
        doesFilterPass: ({ node, model, evaluatorParams }) => {
            const value = evaluatorParams.getValue(node);

            if (value == null) {
                return true;
            }

            return value > model;
        },
        getModelAsString: (model) => (model == null ? '' : '>' + model),
    };
}

const columnDefs: ColDef[] = [
    { field: 'athlete', width: 150 },
    {
        field: 'gold',
        width: 100,
        filter: NumberFilterComponent,
        filterEvaluator: numberFilterEvaluator,
        suppressHeaderMenuButton: true,
    },
    {
        field: 'silver',
        width: 100,
        filter: NumberFilterComponent,
        filterEvaluator: numberFilterEvaluator,
        suppressHeaderMenuButton: true,
    },
    {
        field: 'bronze',
        width: 100,
        filter: NumberFilterComponent,
        filterEvaluator: numberFilterEvaluator,
        suppressHeaderMenuButton: true,
    },
    {
        field: 'total',
        width: 100,
        filter: NumberFilterComponent,
        filterEvaluator: numberFilterEvaluator,
        suppressHeaderMenuButton: true,
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
