import type { GridApi, GridOptions, PdfExportParams } from 'ag-grid-community';
import { ClientSideRowModelModule, ModuleRegistry, createGrid, enableDevValidations } from 'ag-grid-community';
import { ContextMenuModule, PdfExportModule, RowNumbersModule } from 'ag-grid-enterprise';

if (process.env.NODE_ENV !== 'production') {
    // Enable extended validations only for development
    enableDevValidations();
}

ModuleRegistry.registerModules([ClientSideRowModelModule, ContextMenuModule, RowNumbersModule, PdfExportModule]);

interface OrderData {
    customer: string;
    country: string;
    product: string;
    quantity: number;
    total: number;
    internalReference: string;
}

const rowData: OrderData[] = [
    {
        customer: 'Atlas Design',
        country: 'United Kingdom',
        product: 'Mechanical Keyboard',
        quantity: 12,
        total: 1794,
        internalReference: 'Priority account',
    },
    {
        customer: 'Northstar Labs',
        country: 'United States',
        product: 'USB-C Dock',
        quantity: 8,
        total: 1752,
        internalReference: 'Renewal due',
    },
    {
        customer: 'Horizon Studio',
        country: 'Australia',
        product: 'Studio Monitor',
        quantity: 6,
        total: 4134,
        internalReference: 'New customer',
    },
];

let gridApi: GridApi<OrderData>;

const gridOptions: GridOptions<OrderData> = {
    columnDefs: [
        {
            headerName: 'Customer Details',
            children: [
                { field: 'customer', minWidth: 160 },
                { field: 'country', minWidth: 140 },
            ],
        },
        {
            headerName: 'Order Details',
            children: [
                { field: 'product', minWidth: 180 },
                { field: 'quantity' },
                { field: 'total', valueFormatter: (params) => `$${params.value}` },
            ],
        },
        {
            field: 'internalReference',
            headerName: 'Internal Reference',
            hide: true,
        },
    ],
    defaultColDef: {
        flex: 1,
        minWidth: 100,
    },
    rowNumbers: true,
    rowData,
};

function isChecked(id: string): boolean {
    return document.querySelector<HTMLInputElement>(`#${id}`)!.checked;
}

function getPdfExportParams(): PdfExportParams {
    const columnSet = document.querySelector<HTMLSelectElement>('#columnSet')!.value;
    const params: PdfExportParams = {
        skipColumnGroupHeaders: isChecked('skipColumnGroupHeaders'),
        skipColumnHeaders: isChecked('skipColumnHeaders'),
        exportRowNumbers: isChecked('exportRowNumbers'),
        columnWidth: 'auto',
    };

    if (columnSet === 'all') {
        params.allColumns = true;
    } else if (columnSet === 'specific') {
        params.columnKeys = ['customer', 'product', 'total'];
    }

    return params;
}

function onBtExport() {
    gridApi.setGridOption('defaultPdfExportParams', getPdfExportParams());
    gridApi.exportDataAsPdf();
}

document.addEventListener('DOMContentLoaded', () => {
    gridApi = createGrid(document.querySelector<HTMLElement>('#myGrid')!, gridOptions);
});
