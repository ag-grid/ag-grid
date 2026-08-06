import type { GridApi, GridOptions } from 'ag-grid-community';
import { ClientSideRowModelModule, ModuleRegistry, createGrid, enableDevValidations } from 'ag-grid-community';
import { ContextMenuModule, PdfExportModule } from 'ag-grid-enterprise';

if (process.env.NODE_ENV !== 'production') {
    enableDevValidations();
}

ModuleRegistry.registerModules([ClientSideRowModelModule, PdfExportModule, ContextMenuModule]);

interface ReportRow {
    item: string;
    owner: string;
    status: string;
}

let gridApi: GridApi<ReportRow>;

const rowData: ReportRow[] = Array.from({ length: 60 }, (_, index) => ({
    item: `Work item ${index + 1}`,
    owner: ['Amelia', 'Mateo', 'Hana'][index % 3],
    status: index % 4 === 0 ? 'In review' : 'Complete',
}));

const gridOptions: GridOptions<ReportRow> = {
    columnDefs: [
        { field: 'item', flex: 1 },
        { field: 'owner', flex: 1 },
        { field: 'status', flex: 1 },
    ],
    rowData,
    defaultPdfExportParams: {
        page: {
            orientation: 'portrait',
        },
        watermark: {
            text: 'DRAFT',
            opacity: 0.12,
            rotation: -45,
            pages: 'all',
            style: {
                color: '#6b7280',
                fontSize: 92,
                fontWeight: 'bold',
            },
        },
    },
};

function onBtExport() {
    gridApi.exportDataAsPdf();
}

document.addEventListener('DOMContentLoaded', () => {
    gridApi = createGrid(document.querySelector<HTMLElement>('#myGrid')!, gridOptions);
});
