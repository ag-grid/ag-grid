import { ClientSideRowModelModule } from 'ag-grid-community';
import type { GridApi, GridOptions, IDateFilterParams, ISetFilterParams } from 'ag-grid-community';
import { createGrid } from 'ag-grid-community';
import { ModuleRegistry } from 'ag-grid-community';
import { FiltersToolPanelModule } from 'ag-grid-enterprise';
import { MenuModule } from 'ag-grid-enterprise';
import { MultiFilterModule } from 'ag-grid-enterprise';
import { RowGroupingModule } from 'ag-grid-enterprise';
import { SetFilterModule } from 'ag-grid-enterprise';

ModuleRegistry.registerModules([
    ClientSideRowModelModule,
    FiltersToolPanelModule,
    MenuModule,
    MultiFilterModule,
    RowGroupingModule,
    SetFilterModule,
]);

const dateFilterParams: IDateFilterParams = {
    comparator: (filterLocalDateAtMidnight: Date, cellValue: string) => {
        const dateAsString = cellValue;
        if (dateAsString == null) return -1;
        const dateParts = dateAsString.split('/');
        const cellDate = new Date(Number(dateParts[2]), Number(dateParts[1]) - 1, Number(dateParts[0]));

        if (filterLocalDateAtMidnight.getTime() === cellDate.getTime()) {
            return 0;
        }

        if (cellDate < filterLocalDateAtMidnight) {
            return -1;
        }

        if (cellDate > filterLocalDateAtMidnight) {
            return 1;
        }
        return 0;
    },
    minValidYear: 2000,
    maxValidYear: 2021,
    inRangeFloatingFilterDateFormat: 'Do MMM YYYY',
};

let gridApi: GridApi<IOlympicData>;

const gridOptions: GridOptions<IOlympicData> = {
    columnDefs: [
        {
            field: 'country',
            rowGroup: true,
            filter: 'agTextColumnFilter',
        },
        { field: 'year', rowGroup: true },
        {
            field: 'athlete',
            rowGroup: true,
            filter: false,
        },
        {
            field: 'age',
            headerName: 'Age',
            filter: 'agMultiColumnFilter',
        },
        {
            field: 'date',
            filter: 'agDateColumnFilter',
            filterParams: dateFilterParams,
        },
        { field: 'gold', filter: 'agNumberColumnFilter' },
        {
            field: 'silver',
            filterParams: { excelMode: 'windows' } as ISetFilterParams,
        },
        { field: 'bronze' },
    ],
    defaultColDef: {
        flex: 1,
        minWidth: 150,
        filter: true,
        floatingFilter: true,
        enableRowGroup: true,
    },
    autoGroupColumnDef: {
        minWidth: 200,
        filter: 'agGroupColumnFilter',
    },
    rowGroupPanelShow: 'always',
    sideBar: 'filters',
};

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);

    fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
        .then((response) => response.json())
        .then((data: IOlympicData[]) => gridApi!.setGridOption('rowData', data));
});
