import type { GridOptions, IFileProcessorParams } from 'ag-grid-community';
import {
    AutoGenerateColumnsModule,
    ClientSideRowModelModule,
    ModuleRegistry,
    ValidationModule,
    createGrid,
} from 'ag-grid-community';

ModuleRegistry.registerModules([
    ClientSideRowModelModule,
    AutoGenerateColumnsModule,
    ...(process.env.NODE_ENV !== 'production' ? [ValidationModule] : []),
]);

function parseCsv(text: string): Record<string, string>[] {
    const lines = text.trim().split('\n');
    if (lines.length < 2) return [];
    const headers = lines[0].split(',').map((h) => h.trim());
    return lines.slice(1).map((line) => {
        const values = line.split(',');
        return Object.fromEntries(headers.map((h, i) => [h, values[i]?.trim() ?? '']));
    });
}

function processFiles(params: IFileProcessorParams): void {
    const file = params.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onerror = () => params.fail('Failed to read file');
    reader.onload = (e) => {
        try {
            const rowData = parseCsv(e.target?.result as string);
            params.success(rowData);
        } catch {
            params.fail('Failed to parse file');
        }
    };
    reader.readAsText(file);
}

const gridOptions: GridOptions = {
    autoGenerateColumnDefs: true,
    fileProcessor: { processFiles },
    defaultColDef: {
        flex: 1,
        minWidth: 100,
    },
};

document.addEventListener('DOMContentLoaded', () => {
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    createGrid(gridDiv, gridOptions);
});
