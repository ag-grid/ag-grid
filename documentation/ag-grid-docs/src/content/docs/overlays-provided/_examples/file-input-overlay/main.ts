import type { GridOptions, ProcessFileInputParams } from 'ag-grid-community';
import {
    AutoGenerateColumnsModule,
    ClientSideRowModelModule,
    ModuleRegistry,
    ValidationModule,
    createGrid,
} from 'ag-grid-community';

declare let XLSX: any;

ModuleRegistry.registerModules([
    ClientSideRowModelModule,
    AutoGenerateColumnsModule,
    ...(process.env.NODE_ENV !== 'production' ? [ValidationModule] : []),
]);

function parseWorkbook(workbook: any): Record<string, unknown>[] {
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];
    return XLSX.utils.sheet_to_json(worksheet);
}

function processFileInput(params: ProcessFileInputParams): void {
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
}

const gridOptions: GridOptions = {
    autoGenerateColumnDefs: true,
    processFileInput,
    defaultColDef: {
        flex: 1,
        minWidth: 100,
    },
};

document.addEventListener('DOMContentLoaded', () => {
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    createGrid(gridDiv, gridOptions);
});
