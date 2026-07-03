import type { GridApi, GridOptions } from 'ag-grid-community';
import {
    CellStyleModule,
    ClientSideRowModelModule,
    CsvExportModule,
    ModuleRegistry,
    createGrid,
    enableDevValidations,
} from 'ag-grid-community';
import { ColumnMenuModule, ContextMenuModule, ExcelExportModule } from 'ag-grid-enterprise';

// Enable extended validations only for development
if (process.env.NODE_ENV !== 'production') {
    enableDevValidations();
}

ModuleRegistry.registerModules([
    CellStyleModule,
    ClientSideRowModelModule,
    CsvExportModule,
    ExcelExportModule,
    ColumnMenuModule,
    ContextMenuModule,
]);

let gridApi: GridApi;

const gridOptions: GridOptions = {
    columnDefs: [
        { headerName: 'provided', field: 'rawValue' },
        { headerName: 'number', field: 'rawValue', cellClass: 'numberType' },
        { headerName: 'currency', field: 'rawValue', cellClass: 'currencyFormat' },
        { headerName: 'boolean', field: 'rawValue', cellClass: 'booleanType' },
        {
            headerName: 'Negative',
            field: 'negativeValue',
            cellClass: 'negativeInBrackets',
        },
        { headerName: 'string', field: 'rawValue', cellClass: 'stringType' },
        {
            headerName: 'Date',
            field: 'dateValue',
            cellClass: 'dateType',
            minWidth: 220,
        },
    ],
    defaultColDef: {
        flex: 1,
        minWidth: 100,
    },
    rowData: [
        {
            rawValue: 1,
            negativeValue: -10,
            dateValue: '2009-04-20T00:00:00.000',
        },
    ],
    excelStyles: [
        {
            id: 'numberType',
            numberFormat: {
                format: '0',
            },
        },
        {
            id: 'currencyFormat',
            numberFormat: {
                format: '#,##0.00 €',
            },
        },
        {
            id: 'negativeInBrackets',
            numberFormat: {
                format: '$[blue] #,##0;$ [red](#,##0)',
            },
        },
        {
            id: 'booleanType',
            dataType: 'Boolean',
        },
        {
            id: 'stringType',
            dataType: 'String',
        },
        {
            id: 'dateType',
            dataType: 'DateTime',
        },
    ],
    popupParent: document.body,
};

function onBtExport() {
    gridApi!.exportDataAsExcel();
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', () => {
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);
});
