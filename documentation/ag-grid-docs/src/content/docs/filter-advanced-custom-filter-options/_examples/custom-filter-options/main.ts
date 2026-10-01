import type {
    GridApi,
    GridOptions,
    IDateFilterParams,
    INumberFilterParams,
    ITextFilterParams,
} from 'ag-grid-community';
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

let gridApi: GridApi<IOlympicData>;

const athleteFilterParams: ITextFilterParams = {
    filterOptions: [
        'contains',
        {
            displayKey: 'startsWithA',
            displayName: 'Starts With A',
            numberOfInputs: 0,
            predicate: (_, cellValue) => cellValue != null && cellValue.startsWith('A'),
        },
        {
            displayKey: 'notStartsWith',
            displayName: 'Does Not Start With',
            numberOfInputs: 1,
            predicate: ([filterValue], cellValue) =>
                cellValue != null && !cellValue.toLowerCase().startsWith(String(filterValue).toLowerCase()),
        },
    ],
};

const ageFilterParams: INumberFilterParams = {
    filterOptions: [
        'equals',
        {
            displayKey: 'evenNumbers',
            displayName: 'Even Numbers',
            numberOfInputs: 0,
            predicate: (_, cellValue) => cellValue != null && cellValue % 2 === 0,
        },
        {
            displayKey: 'betweenExclusive',
            displayName: 'Between (Exclusive)',
            numberOfInputs: 2,
            predicate: ([from, to], cellValue) => cellValue != null && cellValue > from && cellValue < to,
        },
    ],
};

const dateFilterParams: IDateFilterParams = {
    filterOptions: [
        'equals',
        {
            displayKey: 'leapYear',
            displayName: 'Leap Year',
            numberOfInputs: 0,
            predicate: (_, cellValue) => {
                if (cellValue == null) {
                    return false;
                }
                const year = Number(cellValue.split('-')[0]);
                return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
            },
        },
        {
            displayKey: 'betweenExclusive',
            displayName: 'Between (Exclusive)',
            numberOfInputs: 2,
            predicate: ([from, to], cellValue) => {
                if (cellValue == null) {
                    return false;
                }
                // Built as a local date: the filter's own values are local midnight, and
                // `new Date('YYYY-MM-DD')` would be UTC midnight, so the two would not line up.
                const [year, month, day] = cellValue.split('-').map(Number);
                const cellDate = new Date(year, month - 1, day);
                return cellDate > from && cellDate < to;
            },
        },
    ],
};

const gridOptions: GridOptions<IOlympicData> = {
    columnDefs: [
        { field: 'athlete', filterParams: athleteFilterParams },
        { field: 'age', minWidth: 120, filterParams: ageFilterParams },
        { field: 'date', filter: 'agDateColumnFilter', filterParams: dateFilterParams },
        { field: 'sport' },
        { field: 'gold' },
    ],
    defaultColDef: {
        flex: 1,
        minWidth: 180,
        filter: true,
    },
    enableAdvancedFilter: true,
};

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', () => {
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);

    fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
        .then((response) => response.json())
        .then((data: IOlympicData[]) =>
            gridApi!.setGridOption(
                'rowData',
                // The supplied dates are `dd/mm/yyyy` strings, which is a text column. Convert them to
                // `yyyy-mm-dd` so the column is a Date (String) one and its options filter on dates.
                data.map((rowData) => {
                    const [day, month, year] = rowData.date.split('/');
                    return { ...rowData, date: `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}` };
                })
            )
        );
});
