import type { ColDef, GridApi, GridOptions } from 'ag-grid-community';
import {
    ClientSideRowModelModule,
    DateFilterModule,
    ModuleRegistry,
    TextFilterModule,
    createGrid,
    enableDevValidations,
} from 'ag-grid-community';

if (process.env.NODE_ENV !== 'production') {
    // Enable extended validations only for development
    enableDevValidations();
}

ModuleRegistry.registerModules([ClientSideRowModelModule, DateFilterModule, TextFilterModule]);

const columnDefs: ColDef[] = [
    { field: 'athlete' },
    {
        field: 'date',
        filter: 'agDateColumnFilter',
        filterParams: {
            // Adds the built-in named & relative ranges to the options the Date Filter already offers
            filterOptions: {
                yesterday: true,
                today: true,
                tomorrow: true,
                last7Days: true,
                lastWeek: true,
                thisWeek: true,
                nextWeek: true,
                last30Days: true,
                lastMonth: true,
                thisMonth: true,
                nextMonth: true,
                last90Days: true,
                lastQuarter: true,
                thisQuarter: true,
                nextQuarter: true,
                lastYear: true,
                thisYear: true,
                yearToDate: true,
                nextYear: true,
                last6Months: true,
                last12Months: true,
                last24Months: true,
            },
        },
    },
];

let gridApi: GridApi<IOlympicData>;

const gridOptions: GridOptions<IOlympicData> = {
    columnDefs: columnDefs,
    defaultColDef: {
        flex: 1,
        minWidth: 150,
        filter: true,
    },
};

// Setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);
    fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
        .then((response) => response.json())
        .then((data) =>
            gridApi.setGridOption(
                'rowData',
                data.map((d: IOlympicData) => ({
                    ...d,
                    date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000 * (Math.random() * 0.5 - Math.random())),
                }))
            )
        );
});
