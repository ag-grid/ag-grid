import type { GridApi, GridOptions } from 'ag-grid-community';
import { ClientSideRowModelModule, ModuleRegistry, createGrid, enableDevValidations } from 'ag-grid-community';
import { ContextMenuModule, PdfExportModule } from 'ag-grid-enterprise';

if (process.env.NODE_ENV !== 'production') {
    enableDevValidations();
}

ModuleRegistry.registerModules([ClientSideRowModelModule, PdfExportModule, ContextMenuModule]);

interface ReportRow {
    department: string;
    owner: string;
    result: number;
}

let gridApi: GridApi<ReportRow>;

const gridOptions: GridOptions<ReportRow> = {
    columnDefs: [
        { field: 'department', flex: 1 },
        { field: 'owner', flex: 1 },
        { field: 'result', headerName: 'Result (%)', flex: 1 },
    ],
    rowData: [
        { department: 'Engineering', owner: 'Maya Singh', result: 94 },
        { department: 'Operations', owner: 'Daniel Price', result: 88 },
        { department: 'Sales', owner: 'Sofia Costa', result: 91 },
        { department: 'Support', owner: 'Noah Williams', result: 96 },
    ],
    defaultPdfExportParams: {
        coverPage: true,
        documentTitle: 'Annual Performance Report',
        documentTitleStyle: {
            fontSize: 24,
            margin: { top: 120, bottom: 8 },
            borderColor: '#123a5a',
            borderWidth: 1,
            color: '#123a5a',
        },
        documentSubtitle: 'Financial year 2026',
        documentSubtitleStyle: {
            color: '#52606d',
            fontSize: 14,
        },
        headerFooterConfig: {
            all: {
                footer: [{ value: 'Page &[Page] of &[Pages]', position: 'Center' }],
            },
            first: {
                footer: [{ value: 'Confidential', position: 'Center', style: { color: '#8b1d1d' } }],
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
