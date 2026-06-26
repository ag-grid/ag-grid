import type { ColDef, GridApi, GridOptions } from 'ag-grid-community';
import {
    ClientSideRowModelModule,
    ModuleRegistry,
    NumberEditorModule,
    NumberFilterModule,
    TextEditorModule,
    TextFilterModule,
    createGrid,
    enableDevValidations,
} from 'ag-grid-community';

import { CustomInnerHeader } from './customInnerHeader_typescript';

// Enable extended validations only for development
if (process.env.NODE_ENV !== 'production') {
    enableDevValidations();
}

ModuleRegistry.registerModules([
    NumberEditorModule,
    TextEditorModule,
    TextFilterModule,
    NumberFilterModule,
    ClientSideRowModelModule,
]);

const columnDefs: ColDef[] = [
    { field: 'athlete', suppressHeaderFilterButton: true, minWidth: 120 },
    {
        field: 'age',
        sortable: false,
        headerComponentParams: {
            icon: 'fa-user',
        },
    },
    { field: 'country', suppressHeaderFilterButton: true, minWidth: 120 },
    { field: 'year', sortable: false },
    { field: 'date', suppressHeaderFilterButton: true },
    { field: 'sport', sortable: false },
    {
        field: 'gold',
        headerComponentParams: { icon: 'fa-cog' },
        minWidth: 120,
    },
    { field: 'silver', sortable: false },
    { field: 'bronze', suppressHeaderFilterButton: true, minWidth: 120 },
    { field: 'total', sortable: false },
];

let gridApi: GridApi<IOlympicData>;

const gridOptions: GridOptions<IOlympicData> = {
    columnDefs: columnDefs,
    defaultColDef: {
        editable: true,
        flex: 1,
        minWidth: 100,
        filter: true,
        headerComponentParams: {
            innerHeaderComponent: CustomInnerHeader,
        },
    },
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
