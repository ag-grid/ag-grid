import type { GridApi, GridOptions } from 'ag-grid-community';
import {
    ClientSideRowModelModule,
    CsvExportModule,
    ModuleRegistry,
    NumberFilterModule,
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
    TextFilterModule,
    NumberFilterModule,
    ClientSideRowModelModule,
    CsvExportModule,
    ExcelExportModule,
    ColumnMenuModule,
    ContextMenuModule,
]);

let gridApi: GridApi<IOlympicData>;

const isChecked = (selector: string): boolean => document.querySelector<HTMLInputElement>(selector)?.checked ?? false;
const getInputValue = (selector: string): string => document.querySelector<HTMLInputElement>(selector)?.value ?? '';

const gridOptions: GridOptions<IOlympicData> = {
    columnDefs: [
        { field: 'athlete', minWidth: 200 },
        { field: 'country', minWidth: 180 },
        { field: 'sport', minWidth: 150 },
        { field: 'gold', width: 100 },
        { field: 'silver', width: 100 },
        { field: 'bronze', width: 100 },
        { field: 'total', width: 100 },
    ],
    defaultColDef: {
        filter: true,
        minWidth: 100,
        flex: 1,
    },
};

function onBtExport() {
    const password = getInputValue('#worksheetPassword').trim() || undefined;
    const autoFilter = isChecked('#allowAutoFilter');
    const formatCells = isChecked('#allowFormatCells');

    gridApi!.exportDataAsExcel({
        protectSheet: {
            password,
            autoFilter,
            formatCells,
        },
    });
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
