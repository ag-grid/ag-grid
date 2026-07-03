import type { GridApi, GridOptions, ProcessFileInputParams } from 'ag-grid-community';
import {
    AutoGenerateColumnsModule,
    ClientSideRowModelModule,
    ModuleRegistry,
    createGrid,
    enableDevValidations,
} from 'ag-grid-community';
import { ColumnMenuModule, ContextMenuModule, ExcelExportModule } from 'ag-grid-enterprise';

declare let XLSX: any;

// Enable extended validations only for development
if (process.env.NODE_ENV !== 'production') {
    enableDevValidations();
}

ModuleRegistry.registerModules([
    ClientSideRowModelModule,
    AutoGenerateColumnsModule,
    ExcelExportModule,
    ColumnMenuModule,
    ContextMenuModule,
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
        reader.onerror = () => params.fail('Failed to read file');
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

function uploadFile() {
    const curr = gridApi.getGridOption('activeOverlay');
    gridApi.setGridOption('activeOverlay', curr === 'agFileInputOverlay' ? undefined : 'agFileInputOverlay');
}

function importExcel() {
    fetch('https://www.ag-grid.com/example-assets/olympic-data.xlsx')
        .then((response) => response.arrayBuffer())
        .then((data: ArrayBuffer) => {
            const workbook = XLSX.read(new Uint8Array(data));
            gridApi.updateGridOptions({ rowData: parseWorkbook(workbook), activeOverlay: undefined });
        });
}

document.addEventListener('DOMContentLoaded', function () {
    const eGridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(eGridDiv, gridOptions);
});
