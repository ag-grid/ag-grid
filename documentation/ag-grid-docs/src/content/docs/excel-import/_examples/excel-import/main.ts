import type { GridApi, GridOptions, ProcessFileInputParams } from 'ag-grid-community';
import {
    AutoGenerateColumnsModule,
    ClientSideRowModelModule,
    ModuleRegistry,
    ValidationModule,
    createGrid,
} from 'ag-grid-community';
import { ColumnMenuModule, ContextMenuModule, ExcelExportModule } from 'ag-grid-enterprise';

declare let XLSX: any;

ModuleRegistry.registerModules([
    ClientSideRowModelModule,
    AutoGenerateColumnsModule,
    ExcelExportModule,
    ColumnMenuModule,
    ContextMenuModule,
    ...(process.env.NODE_ENV !== 'production' ? [ValidationModule] : []),
]);

let gridApi: GridApi;

const gridOptions: GridOptions = {
    autoGenerateColumnDefs: true,

    defaultColDef: {
        minWidth: 80,
        flex: 1,
    },

    processFileInput: (params: ProcessFileInputParams) => {
        const file = params.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const workbook = XLSX.read(new Uint8Array(e.target?.result as ArrayBuffer));
                params.success(parseWorkbook(workbook));
            } catch {
                params.fail('Failed to parse file');
            }
        };
        reader.readAsArrayBuffer(file);
    },
};

function parseWorkbook(workbook: any): Record<string, unknown>[] {
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];
    return XLSX.utils.sheet_to_json(worksheet);
}

function clearData() {
    gridApi.setGridOption('rowData', null);
    gridApi.setGridOption('columnDefs', []);
}

function importExcel() {
    fetch('https://www.ag-grid.com/example-assets/olympic-data.xlsx')
        .then((response) => response.arrayBuffer())
        .then((data: ArrayBuffer) => {
            const workbook = XLSX.read(new Uint8Array(data));
            gridApi.setGridOption('rowData', parseWorkbook(workbook));
        });
}

document.addEventListener('DOMContentLoaded', function () {
    const eGridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(eGridDiv, gridOptions);
});
