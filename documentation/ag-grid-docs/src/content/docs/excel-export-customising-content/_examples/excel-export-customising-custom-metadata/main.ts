import type { GridApi, GridOptions } from 'ag-grid-community';
import {
    ClientSideRowModelModule,
    CsvExportModule,
    ModuleRegistry,
    NumberFilterModule,
    ValidationModule,
    createGrid,
} from 'ag-grid-community';
import { ExcelExportModule } from 'ag-grid-enterprise';

ModuleRegistry.registerModules([
    ClientSideRowModelModule,
    CsvExportModule,
    ExcelExportModule,
    NumberFilterModule,
    ...(process.env.NODE_ENV !== 'production' ? [ValidationModule] : []),
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

const excelCustomMetadata = {
    ExportID: '12345',
    GeneratedBy: 'AgGrid',
    ExpirationDate: '2025-01-01T12:00:00Z',
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
        excelCustomMetadata: excelCustomMetadata,
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
