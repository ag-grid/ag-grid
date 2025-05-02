import type {
    GridApi,
    GridOptions,
    IDateFilterParams,
    IMultiFilterParams,
    ISetFilterParams,
    ITextFilterParams,
} from 'ag-grid-community';
import {
    ClientSideRowModelModule,
    DateFilterModule,
    ModuleRegistry,
    TextFilterModule,
    ValidationModule,
    createGrid,
} from 'ag-grid-community';
import { MultiFilterModule, SetFilterModule } from 'ag-grid-enterprise';

ModuleRegistry.registerModules([
    ClientSideRowModelModule,
    MultiFilterModule,
    SetFilterModule,
    TextFilterModule,
    DateFilterModule,
    ...(process.env.NODE_ENV !== 'production' ? [ValidationModule] : []),
]);

const dateFilterParams: IMultiFilterParams = {
    filters: [
        {
            filter: 'agDateColumnFilter',
            filterParams: {
                comparator: (filterDate: Date, cellValue: string) => {
                    if (cellValue == null) return -1;

                    return getDate(cellValue).getTime() - filterDate.getTime();
                },
            } as IDateFilterParams,
        },
        {
            filter: 'agSetColumnFilter',
            filterParams: {
                comparator: (a: string, b: string) => {
                    return getDate(a).getTime() - getDate(b).getTime();
                },
            } as ISetFilterParams,
        },
    ],
};

let gridApi: GridApi<IOlympicData>;

const gridOptions: GridOptions<IOlympicData> = {
    columnDefs: [
        {
            field: 'athlete',
            filter: 'agMultiColumnFilter',
            filterParams: {
                filters: [
                    {
                        filter: 'agTextColumnFilter',
                        filterParams: {
                            defaultOption: 'startsWith',
                        } as ITextFilterParams,
                    },
                    {
                        filter: 'agSetColumnFilter',
                    },
                ],
            } as IMultiFilterParams,
        },
        {
            field: 'date',
            filter: 'agMultiColumnFilter',
            filterParams: dateFilterParams,
        },
        { field: 'country', filter: 'agMultiColumnFilter' },
        { field: 'sport', filter: 'agMultiColumnFilter' },
    ],
    defaultColDef: {
        flex: 1,
        minWidth: 200,
    },
};

function getDate(value: string): Date {
    const dateParts = value.split('/');
    return new Date(Number(dateParts[2]), Number(dateParts[1]) - 1, Number(dateParts[0]));
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);

    fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
        .then((response) => response.json())
        .then((data: IOlympicData[]) => gridApi!.setGridOption('rowData', data));
});
