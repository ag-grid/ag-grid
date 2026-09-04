import type { GridApi, GridOptions } from 'ag-grid-community';
import { ClientSideRowModelModule, ModuleRegistry, createGrid, enableDevValidations } from 'ag-grid-community';
import { ContextMenuModule, PdfExportModule, RowGroupingModule } from 'ag-grid-enterprise';

if (process.env.NODE_ENV !== 'production') {
    // Enable extended validations only for development
    enableDevValidations();
}

ModuleRegistry.registerModules([ClientSideRowModelModule, ContextMenuModule, RowGroupingModule, PdfExportModule]);

interface OrderData {
    region: string;
    customer: string;
    product: string;
    quantity: number;
    total: number | null;
}

const rowData: OrderData[] = [
    { region: 'EMEA', customer: 'Aurora Systems', product: 'Wireless Keyboard', quantity: 12, total: 1794 },
    { region: 'EMEA', customer: 'Baltic Analytics', product: 'Studio Monitor', quantity: 4, total: 2756 },
    { region: 'Americas', customer: 'Northstar Labs', product: 'USB-C Dock', quantity: 8, total: 1752 },
    { region: 'Americas', customer: 'Cedar Freight', product: 'Wireless Keyboard', quantity: 20, total: null },
    { region: 'APAC', customer: 'Horizon Studio', product: 'Studio Monitor', quantity: 6, total: 4134 },
    { region: 'APAC', customer: 'Kite Robotics', product: 'USB-C Dock', quantity: 3, total: 657 },
];

let gridApi: GridApi<OrderData>;

const gridOptions: GridOptions<OrderData> = {
    columnDefs: [
        { field: 'region', rowGroup: true, hide: true },
        {
            headerName: 'Customer Details',
            children: [
                { field: 'customer', minWidth: 180 },
                { field: 'product', minWidth: 180 },
            ],
        },
        {
            headerName: 'Order Details',
            children: [
                { field: 'quantity' },
                { field: 'total', valueFormatter: (params) => (params.value == null ? '' : `$${params.value}`) },
            ],
        },
    ],
    defaultColDef: { flex: 1, minWidth: 110 },
    autoGroupColumnDef: { headerName: 'Region', minWidth: 200 },
    groupDefaultExpanded: -1,
    rowData,
    defaultPdfExportParams: {
        columnWidth: 'auto',
        processCellCallback: (params) => (params.value == null ? 'Not invoiced' : params.formatValue(params.value)),
        processRowGroupCallback: (params) => `Region: ${params.node.key ?? ''}`,
        processHeaderCallback: (params) => {
            const { headerName } = params.column.getColDef();
            return (headerName ?? params.column.getColId()).toUpperCase();
        },
        processGroupHeaderCallback: (params) => `${params.columnGroup.getColGroupDef()?.headerName ?? ''} (grouped)`,
    },
};

function onBtExport() {
    gridApi.exportDataAsPdf();
}

document.addEventListener('DOMContentLoaded', () => {
    gridApi = createGrid(document.querySelector<HTMLElement>('#myGrid')!, gridOptions);
});
