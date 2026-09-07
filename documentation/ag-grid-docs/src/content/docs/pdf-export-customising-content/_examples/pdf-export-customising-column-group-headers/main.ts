import type {
    GridApi,
    GridOptions,
    ProcessGroupHeaderForExportParams,
    ProcessHeaderForExportParams,
} from 'ag-grid-community';
import {
    ClientSideRowModelModule,
    ColumnApiModule,
    ModuleRegistry,
    createGrid,
    enableDevValidations,
} from 'ag-grid-community';
import { ContextMenuModule, PdfExportModule } from 'ag-grid-enterprise';

if (process.env.NODE_ENV !== 'production') {
    // Enable extended validations only for development
    enableDevValidations();
}

ModuleRegistry.registerModules([ClientSideRowModelModule, ColumnApiModule, ContextMenuModule, PdfExportModule]);

interface ResultData {
    athlete: string;
    country: string;
    gold: number;
    silver: number;
}

let gridApi: GridApi<ResultData>;

const gridOptions: GridOptions<ResultData> = {
    columnDefs: [
        {
            headerName: 'Athlete Details',
            children: [
                { field: 'athlete', minWidth: 180 },
                { field: 'country', minWidth: 150 },
            ],
        },
        {
            headerName: 'Medal Results',
            children: [{ field: 'gold' }, { field: 'silver' }],
        },
    ],
    defaultColDef: {
        flex: 1,
        minWidth: 100,
    },
    defaultPdfExportParams: {
        processHeaderCallback(params: ProcessHeaderForExportParams): string {
            return `header: ${params.api.getDisplayNameForColumn(params.column, null)}`;
        },
        processGroupHeaderCallback(params: ProcessGroupHeaderForExportParams): string {
            return `group header: ${params.api.getDisplayNameForColumnGroup(params.columnGroup, null)}`;
        },
    },
    rowData: [
        { athlete: 'Asha Patel', country: 'United Kingdom', gold: 2, silver: 1 },
        { athlete: 'Sofia Rossi', country: 'Italy', gold: 3, silver: 2 },
        { athlete: 'Mei Chen', country: 'Singapore', gold: 1, silver: 2 },
    ],
};

function onBtExport() {
    gridApi.exportDataAsPdf();
}

document.addEventListener('DOMContentLoaded', () => {
    gridApi = createGrid(document.querySelector<HTMLElement>('#myGrid')!, gridOptions);
});
