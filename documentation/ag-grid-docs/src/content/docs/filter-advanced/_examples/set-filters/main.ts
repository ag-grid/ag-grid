import type { GridApi, GridOptions, ValueFormatterParams } from 'ag-grid-community';
import {
    ClientSideRowModelModule,
    ModuleRegistry,
    NumberFilterModule,
    TextFilterModule,
    createGrid,
    enableDevValidations,
} from 'ag-grid-community';
import { AdvancedFilterModule, ColumnMenuModule, ContextMenuModule, SetFilterModule } from 'ag-grid-enterprise';

if (process.env.NODE_ENV !== 'production') {
    // Enable extended validations only for development
    enableDevValidations();
}

ModuleRegistry.registerModules([
    TextFilterModule,
    NumberFilterModule,
    SetFilterModule,
    AdvancedFilterModule,
    ClientSideRowModelModule,
    ColumnMenuModule,
    ContextMenuModule,
]);

interface IOlympicDataTypes extends IOlympicData {
    dateObject: Date;
}

let gridApi: GridApi<IOlympicDataTypes>;

const gridOptions: GridOptions<IOlympicDataTypes> = {
    columnDefs: [
        { field: 'athlete', filter: 'agTextColumnFilter' },
        { field: 'country', filter: 'agSetColumnFilter' },
        {
            field: 'sport',
            filter: 'agSetColumnFilter',
            filterParams: {
                valueFormatter: ({ value }: ValueFormatterParams<IOlympicDataTypes, string>) =>
                    (value ?? '').toUpperCase(),
            },
        },
        {
            field: 'dateObject',
            headerName: 'Date',
            filter: 'agSetColumnFilter',
            filterParams: {
                treeList: true,
            },
        },
        { field: 'gold', filter: 'agNumberColumnFilter' },
    ],
    defaultColDef: {
        flex: 1,
        minWidth: 150,
    },
    enableAdvancedFilter: true,
};

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', () => {
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);

    fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
        .then((response) => response.json())
        .then((data: IOlympicDataTypes[]) =>
            gridApi!.setGridOption(
                'rowData',
                data.map((row) => {
                    // The Tree List groups a date by year, month and day, which needs a real Date.
                    const [day, month, year] = row.date.split('/');
                    return { ...row, dateObject: new Date(Number(year), Number(month) - 1, Number(day)) };
                })
            )
        );
});
