import type { ColDef, GridApi, GridOptions, IFileProcessorParams } from 'ag-grid-community';
import {
    AutoGenerateColumnsModule,
    ClientSideRowModelModule,
    ModuleRegistry,
    NumberFilterModule,
    TextFilterModule,
    ValidationModule,
    createGrid,
    forEachColDef,
} from 'ag-grid-community';
import { ToolbarModule } from 'ag-grid-enterprise';

declare let XLSX: any;

ModuleRegistry.registerModules([
    ClientSideRowModelModule,
    AutoGenerateColumnsModule,
    TextFilterModule,
    NumberFilterModule,
    ToolbarModule,
    ...(process.env.NODE_ENV !== 'production' ? [ValidationModule] : []),
]);

let gridApi: GridApi;

function parseWorkbook(workbook: any): Record<string, unknown>[] {
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];
    return XLSX.utils.sheet_to_json(worksheet);
}

function processFiles(params: IFileProcessorParams): void {
    const file = params.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onerror = () => {
        params.fail('Failed to read file');
    };
    reader.onload = (e) => {
        try {
            const workbook = XLSX.read(new Uint8Array(e.target?.result as ArrayBuffer));
            params.success(parseWorkbook(workbook));
        } catch (error) {
            console.error(error);
            params.fail('Failed to parse file');
        }
    };
    reader.readAsArrayBuffer(file);
}

const gridOptions: GridOptions = {
    autoGenerateColumnDefs: true,
    fileProcessor: { processFiles },
    defaultColDef: {
        minWidth: 80,
        flex: 1,
    },
    toolbar: {
        items: [
            {
                label: 'Clear Data',
                icon: 'cancel',
                alignment: 'right',
                action: () => {
                    gridApi.setGridOption('rowData', null);
                },
            },
        ],
    },
};

function onLoadSampleData(): void {
    const select = document.getElementById('sampleData') as HTMLSelectElement;
    const value = select.value;
    if (!value) return;

    if (value.endsWith('.xlsx')) {
        fetch(`https://www.ag-grid.com/example-assets/${value}`)
            .then((response) => response.arrayBuffer())
            .then((data: ArrayBuffer) => {
                const workbook = XLSX.read(new Uint8Array(data));
                gridApi.setGridOption('rowData', parseWorkbook(workbook));
            });
    } else {
        fetch(`https://www.ag-grid.com/example-assets/${value}`)
            .then((response) => response.json())
            .then((rowData) => {
                gridApi.setGridOption('rowData', rowData);
            });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);
});
