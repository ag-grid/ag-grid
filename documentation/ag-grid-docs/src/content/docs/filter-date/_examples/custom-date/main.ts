import type { ColDef, GridApi, GridOptions } from 'ag-grid-community';
import {
    ClientSideRowModelModule,
    DateFilterModule,
    ModuleRegistry,
    TextFilterModule,
    createGrid,
    enableDevValidations,
} from 'ag-grid-community';

import { CustomDateComponent } from './customDateComponent_typescript';

if (process.env.NODE_ENV !== 'production') {
    // Enable extended validations only for development
    enableDevValidations();
}

ModuleRegistry.registerModules([TextFilterModule, ClientSideRowModelModule, DateFilterModule]);

const columnDefs: ColDef[] = [
    { field: 'athlete' },
    { field: 'country' },
    {
        field: 'date',
        minWidth: 190,
        dateComponent: CustomDateComponent,
    },
    { field: 'sport' },
];

interface OlympicWinner extends Omit<IOlympicData, 'date'> {
    date: Date;
}

let gridApi: GridApi<OlympicWinner>;

const gridOptions: GridOptions<OlympicWinner> = {
    defaultColDef: {
        flex: 1,
        minWidth: 100,
        filter: true,
        floatingFilter: true,
    },
    columnDefs: columnDefs,
    rowData: null,
};

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', () => {
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);

    fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
        .then((response) => response.json())
        .then((data: IOlympicData[]) => {
            gridApi!.setGridOption(
                'rowData',
                data.map((row) => {
                    const dateParts = row.date.split('/');
                    const date = new Date(Number(dateParts[2]), Number(dateParts[1]) - 1, Number(dateParts[0]));
                    return {
                        ...row,
                        date,
                    };
                })
            );
        });
});
