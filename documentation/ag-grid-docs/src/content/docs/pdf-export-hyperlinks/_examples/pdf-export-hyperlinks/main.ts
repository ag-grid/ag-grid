import type { GridApi, GridOptions } from 'ag-grid-community';
import {
    CellStyleModule,
    ClientSideRowModelModule,
    ModuleRegistry,
    createGrid,
    enableDevValidations,
} from 'ag-grid-community';
import { ColumnMenuModule, ContextMenuModule, PdfExportModule } from 'ag-grid-enterprise';

if (process.env.NODE_ENV !== 'production') {
    // Enable extended validations only for development
    enableDevValidations();
}

ModuleRegistry.registerModules([
    CellStyleModule,
    ClientSideRowModelModule,
    PdfExportModule,
    ColumnMenuModule,
    ContextMenuModule,
]);

let gridApi: GridApi;

const gridOptions: GridOptions = {
    columnDefs: [
        { field: 'company', headerName: 'Company' },
        {
            field: 'url',
            headerName: 'Website',
            cellStyle: { color: '#358ccb' },
        },
    ],
    defaultColDef: {
        flex: 1,
        minWidth: 160,
    },
    defaultPdfExportParams: {
        columnWidth: ({ column }) => (column.getColId() === 'url' ? 300 : 160),
        processCellHyperlinkCallback: (params) => (params.column.getColId() === 'url' ? params.value : undefined),
        appendContent: [
            [
                {
                    data: {
                        value: 'AG Grid Documentation',
                        hyperlink: 'https://www.ag-grid.com/documentation/',
                    },
                    mergeAcross: 1,
                    style: {
                        color: '#358ccb',
                        alignment: 'center',
                        padding: 8,
                    },
                },
            ],
        ],
    },
    rowData: [
        { company: 'Google', url: 'https://www.google.com' },
        { company: 'Adobe', url: 'https://www.adobe.com' },
        { company: 'The New York Times', url: 'https://www.nytimes.com' },
        { company: 'GitHub', url: 'https://github.com' },
        { company: 'Microsoft', url: 'https://www.microsoft.com' },
    ],
};

function onBtExport() {
    gridApi.exportDataAsPdf();
}

document.addEventListener('DOMContentLoaded', () => {
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);
});
