import type { ExcelStyle, GridApi, GridOptions } from 'ag-grid-community';
import {
    CellStyleModule,
    ClientSideRowModelModule,
    CsvExportModule,
    ModuleRegistry,
    NumberFilterModule,
    TextEditorModule,
    TextFilterModule,
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
    TextFilterModule,
    TextEditorModule,
    NumberFilterModule,
    ClientSideRowModelModule,
    CsvExportModule,
    ExcelExportModule,
    ColumnMenuModule,
    ContextMenuModule,
]);

let gridApi: GridApi<IOlympicData>;

const excelStyles: ExcelStyle[] = [
    {
        id: 'unlocked',
        interior: {
            color: '#C6EFCE',
            pattern: 'Solid',
        },
        protection: {
            protected: false,
            hideFormula: false,
        },
    },
];

const gridOptions: GridOptions<IOlympicData> = {
    columnDefs: [
        {
            headerName: 'Editable (Unlocked)',
            children: [
                { field: 'athlete', minWidth: 200, cellClass: 'unlocked', editable: true },
                { field: 'country', minWidth: 200, cellClass: 'unlocked', editable: true },
            ],
        },
        {
            headerName: 'Read Only (Locked)',
            children: [
                { field: 'sport', minWidth: 150 },
                { field: 'gold' },
                { field: 'silver' },
                { field: 'bronze' },
                { field: 'total' },
            ],
        },
    ],
    defaultColDef: {
        filter: true,
        minWidth: 100,
        flex: 1,
    },
    excelStyles,
    defaultExcelExportParams: {
        protectSheet: true,
    },
};

function onBtExport() {
    gridApi!.exportDataAsExcel();
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);

    fetch('https://www.ag-grid.com/example-assets/small-olympic-winners.json')
        .then((response) => response.json())
        .then(function (data) {
            gridApi!.setGridOption('rowData', data);
        });
});
