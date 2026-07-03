import type { GridApi, GridOptions, ProcessFileInputParams, ToolbarItemActionParams } from 'ag-grid-community';
import {
    AutoGenerateColumnsModule,
    ClientSideRowModelModule,
    ModuleRegistry,
    NumberFilterModule,
    TextFilterModule,
    createGrid,
    enableDevValidations,
} from 'ag-grid-community';
import { ToolbarModule } from 'ag-grid-enterprise';

declare let XLSX: any;

// Enable extended validations only for development
if (process.env.NODE_ENV !== 'production') {
    enableDevValidations();
}

ModuleRegistry.registerModules([
    ClientSideRowModelModule,
    AutoGenerateColumnsModule,
    TextFilterModule,
    NumberFilterModule,
    ToolbarModule,
]);

let gridApi: GridApi;

function parseWorkbook(workbook: any): Record<string, unknown>[] {
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];
    return XLSX.utils.sheet_to_json(worksheet);
}

function processFileInput(params: ProcessFileInputParams): void {
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
    processFileInput: processFileInput,
    defaultColDef: {
        minWidth: 80,
        flex: 1,
    },
    toolbar: {
        items: [
            {
                label: 'Upload File',
                icon: 'document',
                alignment: 'right',
                action: (params: ToolbarItemActionParams) => {
                    const curr = params.api.getGridOption('activeOverlay');
                    params.api.setGridOption(
                        'activeOverlay',
                        curr === 'agFileInputOverlay' ? undefined : 'agFileInputOverlay'
                    );
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
                gridApi.updateGridOptions({ activeOverlay: undefined, rowData: parseWorkbook(workbook) });
            });
    } else {
        fetch(`https://www.ag-grid.com/example-assets/${value}`)
            .then((response) => response.json())
            .then((rows) => {
                gridApi.updateGridOptions({ activeOverlay: undefined, rowData: rows });
            });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);
});
