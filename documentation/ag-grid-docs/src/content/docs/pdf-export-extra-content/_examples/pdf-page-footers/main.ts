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
        headerFooterConfig: {
            all: {
                footer: [
                    { value: '&[Date]', position: 'Left', style: { color: '#52606d' } },
                    {
                        value: 'Page &[Page] of &[Pages]',
                        position: 'Center',
                        style: { fontWeight: 'bold' },
                    },
                    { value: '&[Time]', position: 'Right', style: { color: '#52606d' } },
                ],
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
