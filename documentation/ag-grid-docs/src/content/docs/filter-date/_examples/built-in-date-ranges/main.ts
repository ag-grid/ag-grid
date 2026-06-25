import type { ColDef, GridApi, GridOptions } from 'ag-grid-community';
import {
    ClientSideRowModelModule,
    DateFilterModule,
    ModuleRegistry,
    TextFilterModule,
    createGrid,
    enableDevValidations,
} from 'ag-grid-community';

// Enable extended validations only for development
if (process.env.NODE_ENV !== 'production') {
    enableDevValidations();
}

ModuleRegistry.registerModules([ClientSideRowModelModule, DateFilterModule, TextFilterModule]);

const columnDefs: ColDef[] = [
    { field: 'athlete' },
    {
        field: 'date',
        filter: 'agDateColumnFilter',
        filterParams: {
            // Enable built-in named & relative date ranges
            filterOptions: [
                'empty',
                'yesterday',
                'today',
                'tomorrow',
                'last7Days',
                'lastWeek',
                'thisWeek',
                'nextWeek',
                'last30Days',
                'lastMonth',
                'thisMonth',
                'nextMonth',
                'last90Days',
                'lastQuarter',
                'thisQuarter',
                'nextQuarter',
                'lastYear',
                'thisYear',
                'yearToDate',
                'nextYear',
                'last6Months',
                'last12Months',
                'last24Months',
            ],
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
