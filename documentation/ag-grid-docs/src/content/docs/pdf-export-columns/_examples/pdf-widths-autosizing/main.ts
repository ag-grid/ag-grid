import type { GridApi, GridOptions, PdfExportParams } from 'ag-grid-community';
import {
    ClientSideRowModelModule,
    ModuleRegistry,
    ROW_NUMBERS_COLUMN_ID,
    createGrid,
    enableDevValidations,
} from 'ag-grid-community';
import { ContextMenuModule, PdfExportModule, RowNumbersModule } from 'ag-grid-enterprise';

if (process.env.NODE_ENV !== 'production') {
    // Enable extended validations only for development
    enableDevValidations();
}

ModuleRegistry.registerModules([ClientSideRowModelModule, ContextMenuModule, RowNumbersModule, PdfExportModule]);

interface ProductData {
    sku: string;
    product: string;
    description: string;
    units: number;
    unitPrice: number;
}

const rowData: ProductData[] = [
    {
        sku: 'KB-104',
        product: 'Mechanical Keyboard',
        description: 'Low-profile wireless keyboard with hot-swappable switches and multi-device pairing.',
        units: 128,
        unitPrice: 149.5,
    },
    {
        sku: 'DS-220',
        product: 'USB-C Dock',
        description: 'Twelve-port desktop dock supporting dual displays, Ethernet, audio, and power delivery.',
        units: 76,
        unitPrice: 219,
    },
    {
        sku: 'MN-340',
        product: 'Studio Monitor',
        description: 'Colour-accurate 27-inch display intended for design, photography, and video workflows.',
        units: 42,
        unitPrice: 689,
    },
];

let gridApi: GridApi<ProductData>;

const gridOptions: GridOptions<ProductData> = {
    columnDefs: [
        { field: 'sku', width: 100 },
        { field: 'product', width: 180 },
        { field: 'description', minWidth: 260 },
        { field: 'units', width: 100 },
        { field: 'unitPrice', headerName: 'Unit Price', width: 120, valueFormatter: (p) => `$${p.value}` },
    ],
    defaultColDef: { resizable: true },
    rowNumbers: true,
    rowData,
};

function getPdfExportParams(): PdfExportParams {
    const widthMode = document.querySelector<HTMLSelectElement>('#widthMode')!.value;
    const params: PdfExportParams = { exportRowNumbers: true };

    if (widthMode === 'custom') {
        params.columnWidth = ({ column }) => {
            const columnId = column?.getColId();
            if (columnId === ROW_NUMBERS_COLUMN_ID) {
                return 'auto';
            }
            if (columnId === 'description') {
                return 220;
            }
            if (columnId === 'sku' || columnId === 'units') {
                return 70;
            }
            return 'auto';
        };
    } else {
        params.columnWidth = widthMode === 'grid' ? 'grid' : 'auto';
    }

    return params;
}

function updateDefaultPdfExportParams() {
    gridApi.setGridOption('defaultPdfExportParams', getPdfExportParams());
}

function onBtExport() {
    updateDefaultPdfExportParams();
    gridApi.exportDataAsPdf();
}

document.addEventListener('DOMContentLoaded', () => {
    gridApi = createGrid(document.querySelector<HTMLElement>('#myGrid')!, gridOptions);
    updateDefaultPdfExportParams();
    document.querySelector('#widthMode')!.addEventListener('change', updateDefaultPdfExportParams);
});
