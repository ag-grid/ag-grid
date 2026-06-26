import type { GridApi, GridOptions } from 'ag-grid-community';
import {
    ClientSideRowModelModule,
    CsvExportModule,
    ModuleRegistry,
    NumberFilterModule,
    TextFilterModule,
    createGrid,
    enableDevValidations,
} from 'ag-grid-community';
import { ExcelExportModule } from 'ag-grid-enterprise';

// Enable extended validations only for development
if (process.env.NODE_ENV !== 'production') {
    enableDevValidations();
}

ModuleRegistry.registerModules([
    ClientSideRowModelModule,
    CsvExportModule,
    ExcelExportModule,
    NumberFilterModule,
    TextFilterModule,
]);

interface ReportRow {
    department: string;
    reportId: string;
    owner: string;
    cost: number;
}

const rowData: ReportRow[] = [
    { department: 'Security', reportId: 'RPT-001', owner: 'Morgan', cost: 1200 },
    { department: 'Finance', reportId: 'RPT-014', owner: 'Avery', cost: 5400 },
    { department: 'Operations', reportId: 'RPT-082', owner: 'Jordan', cost: 3100 },
    { department: 'Legal', reportId: 'RPT-109', owner: 'Taylor', cost: 2700 },
];

const customMetadata = {
    ExportID: 'EXP-2026-001',
    ExpirationDate: '2025-01-01T12:00:00Z',
    Disclaimer: 'Preliminary data; subject to audit',
};

let gridApi: GridApi<ReportRow>;

const gridOptions: GridOptions<ReportRow> = {
    columnDefs: [
        { field: 'department', minWidth: 160 },
        { field: 'reportId', minWidth: 140 },
        { field: 'owner', minWidth: 140 },
        { field: 'cost', filter: 'agNumberColumnFilter', minWidth: 120 },
    ],
    defaultColDef: {
        filter: true,
        flex: 1,
        minWidth: 120,
    },
    rowData,
    defaultExcelExportParams: {
        customMetadata: customMetadata,
    },
};

function onBtExport() {
    gridApi!.exportDataAsExcel();
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', () => {
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);
});
