import type { GridApi, GridOptions, PdfExportParams, PdfPageOrientation, PdfPageSize } from 'ag-grid-community';
import { ClientSideRowModelModule, ModuleRegistry, createGrid, enableDevValidations } from 'ag-grid-community';
import { ContextMenuModule, PdfExportModule } from 'ag-grid-enterprise';

if (process.env.NODE_ENV !== 'production') {
    // Enable extended validations only for development
    enableDevValidations();
}

ModuleRegistry.registerModules([ClientSideRowModelModule, ContextMenuModule, PdfExportModule]);

interface InventoryData {
    item: string;
    category: string;
    warehouse: string;
    quantity: number;
    status: string;
}

// Build the rows in the declaration itself: the framework generators inline the `rowData` grid
// option's initialiser and drop the declaration, so a separately-populated array (a top-level
// `rowData.push(...)` loop) is left referencing a name that no longer exists.
const rowData: InventoryData[] = Array.from({ length: 40 }, (_, index) => {
    const categories = ['Accessories', 'Displays', 'Networking', 'Storage'];
    const warehouses = ['London', 'Chicago', 'Singapore'];
    const itemNumber = index + 1;

    return {
        item: `Item ${itemNumber}`,
        category: categories[index % categories.length],
        warehouse: warehouses[index % warehouses.length],
        quantity: 20 + itemNumber * 3,
        status: itemNumber % 4 === 0 ? 'Reorder' : 'Available',
    };
});

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
    defaultPdfExportParams: {
        documentTitle: 'Quarterly Inventory',
        page: {
            size: 'A4',
            orientation: 'landscape',
            margin: 36,
        },
        repeatHeader: true,
        columnWidth: 'auto',
    },
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

function getPdfExportParams(): PdfExportParams {
    return {
        documentTitle: 'Quarterly Inventory',
        page: {
            size: getPageSize(),
            orientation: getPageOrientation(),
            margin: getPageMargin(),
        },
        repeatHeader: document.querySelector<HTMLInputElement>('#repeatHeader')!.checked,
        columnWidth: 'auto',
    };
}

function onPdfExportOptionsChanged() {
    gridApi.setGridOption('defaultPdfExportParams', getPdfExportParams());
}

function onBtExport() {
    gridApi.exportDataAsPdf();
}

document.addEventListener('DOMContentLoaded', () => {
    gridApi = createGrid(document.querySelector<HTMLElement>('#myGrid')!, gridOptions);
});
