import { ClientSideRowModelModule } from 'ag-grid-community';
import {
    ColDef,
    GridApi,
    GridOptions,
    IDateFilterParams,
    INumberFilterParams,
    ITextFilterParams,
    createGrid,
} from 'ag-grid-community';
import { ModuleRegistry } from 'ag-grid-community';

import { CustomNumberFilter } from './custom-number-filter_typescript';
import { CustomFloatingParams, NumberFloatingFilter } from './number-floating-filter_typescript';

ModuleRegistry.registerModules([ClientSideRowModelModule]);

const columnDefs: ColDef[] = [
    {
        field: 'athlete',
        minWidth: 150,
        filter: 'agTextColumnFilter',
        filterParams: {
            debounceMs: 2000,
        } as ITextFilterParams,
    },
    {
        field: 'age',
        filter: 'agNumberColumnFilter',
        filterParams: {
            debounceMs: 0,
        } as INumberFilterParams,
    },
    { field: 'country' },
    { field: 'year' },
    {
        field: 'date',
        minWidth: 180,
        filter: 'agDateColumnFilter',
        filterParams: {
            comparator: function (filterLocalDateAtMidnight: Date, cellValue: string) {
                var dateAsString = cellValue;
                var dateParts = dateAsString.split('/');
                var cellDate = new Date(Number(dateParts[2]), Number(dateParts[1]) - 1, Number(dateParts[0]));

                if (filterLocalDateAtMidnight.getTime() == cellDate.getTime()) {
                    return 0;
                }

                if (cellDate < filterLocalDateAtMidnight) {
                    return -1;
                }

                if (cellDate > filterLocalDateAtMidnight) {
                    return 1;
                }
            },
        } as IDateFilterParams,
        suppressFloatingFilterButton: true,
    },
    { field: 'sport' },
    {
        field: 'gold',
        floatingFilterComponent: NumberFloatingFilter,
        floatingFilterComponentParams: {
            maxValue: 7,
        } as CustomFloatingParams,
        filter: CustomNumberFilter,
        suppressFloatingFilterButton: true,
    },
    {
        field: 'silver',
        floatingFilterComponent: NumberFloatingFilter,
        floatingFilterComponentParams: {
            maxValue: 3,
        } as CustomFloatingParams,
        filter: CustomNumberFilter,
        suppressFloatingFilterButton: true,
    },
    {
        field: 'bronze',
        floatingFilterComponent: NumberFloatingFilter,
        floatingFilterComponentParams: {
            maxValue: 2,
        } as CustomFloatingParams,
        filter: CustomNumberFilter,
        suppressFloatingFilterButton: true,
    },
    {
        field: 'total',
        floatingFilterComponent: NumberFloatingFilter,
        floatingFilterComponentParams: {
            maxValue: 5,
        } as CustomFloatingParams,
        filter: CustomNumberFilter,
        suppressFloatingFilterButton: true,
    },
];

let gridApi: GridApi<IOlympicData>;

const gridOptions: GridOptions<IOlympicData> = {
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
document.addEventListener('DOMContentLoaded', function () {
    var gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);

    fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
        .then((response) => response.json())
        .then((data: IOlympicData[]) => gridApi!.setGridOption('rowData', data));
});
