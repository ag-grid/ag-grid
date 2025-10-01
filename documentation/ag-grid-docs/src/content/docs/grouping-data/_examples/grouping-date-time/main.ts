import type { ColDef, GridApi, GridOptions } from 'ag-grid-community';
import { ClientSideRowModelModule, ModuleRegistry, ValidationModule, createGrid } from 'ag-grid-community';
import {
    ColumnsToolPanelModule,
    PivotModule,
    RowGroupingModule,
    RowGroupingPanelModule,
    SideBarModule,
} from 'ag-grid-enterprise';

ModuleRegistry.registerModules([
    ClientSideRowModelModule,
    RowGroupingModule,
    SideBarModule,
    ColumnsToolPanelModule,
    RowGroupingPanelModule,
    PivotModule,
    ...(process.env.NODE_ENV !== 'production' ? [ValidationModule] : []),
]);

let gridApi: GridApi<IOlympicData>;

const COL_DEFS: ColDef<IOlympicData>[] = [
    {
        field: 'date',
        rowGroup: true,
        enableRowGroup: true,
        enablePivot: true,
        rowGroupingHierarchy: ['year', 'month'],
    },
    { field: 'country' },
    { field: 'sport' },
    { field: 'total', aggFunc: 'sum' },
];

const DATE_REGEX = /\d{2}\/\d{2}\/\d{4}/;
const DATETIME_REGEX = /(\d{2})\/(\d{2})\/(\d{4}).{1,2}(\d{2}):(\d{2}):(\d{2})/;
const pad = (n: number) => (n < 10 ? `0${n}` : n);

const gridOptions: GridOptions<IOlympicData> = {
    columnDefs: COL_DEFS,
    defaultColDef: {
        flex: 1,
        minWidth: 100,
    },
    autoGroupColumnDef: {
        minWidth: 200,
    },
    sideBar: 'columns',
    rowGroupPanelShow: 'always',
    dataTypeDefinitions: {
        dateString: {
            baseDataType: 'dateString',
            extendsDataType: 'dateString',
            valueParser: (params) =>
                params.newValue != null && params.newValue.match(DATE_REGEX) ? params.newValue : null,
            valueFormatter: (params) => (params.value == null ? '' : params.value),
            dataTypeMatcher: (value) => typeof value === 'string' && !!value.match(DATE_REGEX),
            dateParser: (value) => {
                if (value == null || value === '') {
                    return undefined;
                }
                const dateParts = value.split('/');
                return dateParts.length === 3
                    ? new Date(parseInt(dateParts[2]), parseInt(dateParts[1]) - 1, parseInt(dateParts[0]))
                    : undefined;
            },
            dateFormatter: (value) => {
                if (value == null) {
                    return undefined;
                }
                const date = String(value.getDate());
                const month = String(value.getMonth() + 1);
                return `${date.length === 1 ? '0' + date : date}/${
                    month.length === 1 ? '0' + month : month
                }/${value.getFullYear()}`;
            },
        },
        dateTimeString: {
            baseDataType: 'dateTimeString',
            extendsDataType: 'dateTimeString',
            valueParser: (params) => {
                if (params.newValue != null && params.newValue.match(DATETIME_REGEX)) {
                    return params.newValue;
                } else {
                    return null;
                }
            },
            dateParser: (value) => {
                if (value == null) {
                    return;
                }
                let [_, dd, MM, yyyy, HH, mm, ss] = (value.match(DATETIME_REGEX) || Array(7).fill('0')).map(
                    (e) => e || '0'
                );
                return new Date(
                    parseInt(yyyy),
                    parseInt(MM) - 1,
                    parseInt(dd),
                    parseInt(HH),
                    parseInt(mm),
                    parseInt(ss)
                );
            },
            dateFormatter: (value) => {
                // convert to `HH:mm:ss dd/MM/yyyy`
                return value == null
                    ? ''
                    : `${pad(value.getDate())}/${pad(value.getMonth() + 1)}/${value.getFullYear()}` +
                          ' ' +
                          `${pad(value.getHours())}:${pad(value.getMinutes())}:${pad(value.getSeconds())}`;
            },
        },
    },
};

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    var gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);

    fetch('https://www.ag-grid.com/example-assets/small-olympic-winners.json')
        .then((response) => response.json())
        .then((data: IOlympicData[]) => gridApi!.setGridOption('rowData', data));
});

function onChangeFormattedMonth(event: any) {
    const month = event.target.checked ? 'formattedMonth' : 'month';
    COL_DEFS[0].rowGroupingHierarchy![1] = month;
    gridApi.setGridOption('columnDefs', COL_DEFS);
}
