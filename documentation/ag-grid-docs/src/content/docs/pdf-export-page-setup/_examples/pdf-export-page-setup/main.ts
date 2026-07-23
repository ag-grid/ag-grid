import type { GridApi, GridOptions, PdfExportParams, PdfPageOrientation, PdfPageSize } from 'ag-grid-community';
import { ClientSideRowModelModule, ModuleRegistry, createGrid, enableDevValidations } from 'ag-grid-community';
import { PdfExportModule } from 'ag-grid-enterprise';

// Enable extended validations only for development
if (process.env.NODE_ENV !== 'production') {
    enableDevValidations();
}

ModuleRegistry.registerModules([ClientSideRowModelModule, PdfExportModule]);

interface InventoryData {
    item: string;
    category: string;
    warehouse: string;
    quantity: number;
    status: string;
}

const categories = ['Accessories', 'Displays', 'Networking', 'Storage'];
const warehouses = ['London', 'Chicago', 'Singapore'];
const rowData: InventoryData[] = [];

for (let i = 1; i <= 40; i++) {
    rowData.push({
        item: `Item ${i}`,
        category: categories[(i - 1) % categories.length],
        warehouse: warehouses[(i - 1) % warehouses.length],
        quantity: 20 + i * 3,
        status: i % 4 === 0 ? 'Reorder' : 'Available',
    });
}

let gridApi: GridApi<InventoryData>;

const gridOptions: GridOptions<InventoryData> = {
    columnDefs: [
        { field: 'item', minWidth: 170 },
        { field: 'category', minWidth: 130 },
        { field: 'warehouse', minWidth: 120 },
        { field: 'quantity' },
        { field: 'status' },
    ],
    defaultColDef: {
        flex: 1,
        minWidth: 100,
    },
    rowData,
};

function getPageSize(): PdfPageSize {
    const pageSize = document.querySelector<HTMLSelectElement>('#pageSize')!.value;

    if (pageSize === 'Letter') {
        return 'Letter';
    }
    if (pageSize === 'custom') {
        return { width: 420, height: 300 };
    }
    return 'A4';
}

function getPageOrientation(): PdfPageOrientation {
    return document.querySelector<HTMLSelectElement>('#orientation')!.value === 'portrait' ? 'portrait' : 'landscape';
}

function getPageMargin(): number {
    const margin = document.querySelector<HTMLSelectElement>('#margin')!.value;

    if (margin === 'compact') {
        return 18;
    }
    if (margin === 'wide') {
        return 54;
    }
    return 36;
}

function onBtExport() {
    const params: PdfExportParams = {
        documentTitle: 'Quarterly Inventory',
        page: {
            size: getPageSize(),
            orientation: getPageOrientation(),
            margin: getPageMargin(),
        },
        repeatHeader: document.querySelector<HTMLInputElement>('#repeatHeader')!.checked,
        columnWidth: 'auto',
    };

    gridApi.exportDataAsPdf(params);
}

document.addEventListener('DOMContentLoaded', () => {
    gridApi = createGrid(document.querySelector<HTMLElement>('#myGrid')!, gridOptions);
});
