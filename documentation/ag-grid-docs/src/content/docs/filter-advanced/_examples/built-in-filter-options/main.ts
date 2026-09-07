import type { GridApi, GridOptions, IDateFilterParams } from 'ag-grid-community';
import {
    ClientSideRowModelModule,
    DateFilterModule,
    ModuleRegistry,
    NumberFilterModule,
    TextFilterModule,
    createGrid,
    enableDevValidations,
} from 'ag-grid-community';
import { AdvancedFilterModule, ColumnMenuModule, ContextMenuModule } from 'ag-grid-enterprise';

if (process.env.NODE_ENV !== 'production') {
    // Enable extended validations only for development
    enableDevValidations();
}

ModuleRegistry.registerModules([
    TextFilterModule,
    NumberFilterModule,
    DateFilterModule,
    AdvancedFilterModule,
    ClientSideRowModelModule,
    ColumnMenuModule,
    ContextMenuModule,
]);

let gridApi: GridApi<IRow>;

interface IRow {
    athlete: string;
    age: number;
    sport: string;
    date: string;
}

/** The `yyyy-mm-dd` of a Date (String) column, so the data means something relative to whenever it is read. */
function daysAgo(days: number): string {
    const date = new Date();
    date.setDate(date.getDate() - days);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    return `${date.getFullYear()}-${month}-${String(date.getDate()).padStart(2, '0')}`;
}

const rowData: IRow[] = [
    { athlete: 'Michael Phelps', age: 23, sport: 'Swimming', date: daysAgo(0) },
    { athlete: 'Natalie Coughlin', age: 25, sport: 'Swimming', date: daysAgo(3) },
    { athlete: 'Aleksey Nemov', age: 24, sport: 'Gymnastics', date: daysAgo(20) },
    { athlete: 'Alicia Coutts', age: 24, sport: 'Swimming', date: daysAgo(75) },
    { athlete: 'Missy Franklin', age: 17, sport: 'Swimming', date: daysAgo(200) },
    { athlete: 'Ryan Lochte', age: 27, sport: 'Swimming', date: daysAgo(400) },
    { athlete: 'Allison Schmitt', age: 22, sport: 'Swimming', date: daysAgo(600) },
    { athlete: 'Ian Thorpe', age: 17, sport: 'Swimming', date: daysAgo(900) },
    { athlete: 'Dara Torres', age: 33, sport: 'Swimming', date: daysAgo(1500) },
];

const dateFilterParams: IDateFilterParams = {
    filterOptions: ['equals', 'inRange', 'last7Days', 'last30Days', 'thisYear', 'lastYear', 'last24Months'],
};

const gridOptions: GridOptions<IRow> = {
    columnDefs: [
        { field: 'athlete' },
        { field: 'age', minWidth: 120 },
        { field: 'sport' },
        { field: 'date', filter: 'agDateColumnFilter', filterParams: dateFilterParams },
    ],
    defaultColDef: {
        flex: 1,
        minWidth: 150,
        filter: true,
    },
    rowData,
    enableAdvancedFilter: true,
};

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', () => {
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);
});
