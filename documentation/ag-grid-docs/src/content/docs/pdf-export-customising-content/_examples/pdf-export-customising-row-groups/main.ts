import type {
    GridApi,
    GridOptions,
    ProcessCellForExportParams,
    ProcessRowGroupForExportParams,
} from 'ag-grid-community';
import { ClientSideRowModelModule, ModuleRegistry, createGrid, enableDevValidations } from 'ag-grid-community';
import { ContextMenuModule, PdfExportModule, RowGroupingModule } from 'ag-grid-enterprise';

if (process.env.NODE_ENV !== 'production') {
    // Enable extended validations only for development
    enableDevValidations();
}

ModuleRegistry.registerModules([ClientSideRowModelModule, ContextMenuModule, PdfExportModule, RowGroupingModule]);

interface ResultData {
    athlete: string;
    country: string;
    sport: string;
    gold: number;
}

let gridApi: GridApi<ResultData>;

const gridOptions: GridOptions<ResultData> = {
    columnDefs: [
        { field: 'athlete', minWidth: 180 },
        { field: 'country', rowGroup: true, hide: true },
        { field: 'sport', minWidth: 140 },
        { field: 'gold' },
    ],
    defaultColDef: {
        flex: 1,
        minWidth: 100,
    },
    groupDefaultExpanded: -1,
    defaultPdfExportParams: {
        processCellCallback(params: ProcessCellForExportParams): string {
            return `_${params.value ?? ''}_`;
        },
        processRowGroupCallback(params: ProcessRowGroupForExportParams): string {
            return `row group: ${params.node.key ?? ''}`;
        },
    },
    rowData: [
        { athlete: 'Asha Patel', country: 'United Kingdom', sport: 'Rowing', gold: 2 },
        { athlete: 'Noah Williams', country: 'United Kingdom', sport: 'Cycling', gold: 1 },
        { athlete: 'Sofia Rossi', country: 'Italy', sport: 'Swimming', gold: 3 },
        { athlete: 'Marco Bianchi', country: 'Italy', sport: 'Fencing', gold: 1 },
    ],
};

function onBtExport() {
    gridApi.exportDataAsPdf();
}

document.addEventListener('DOMContentLoaded', () => {
    gridApi = createGrid(document.querySelector<HTMLElement>('#myGrid')!, gridOptions);
});
