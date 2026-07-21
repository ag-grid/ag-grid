import type { GridApi, GridOptions } from 'ag-grid-community';
import {
    ClientSideRowModelModule,
    ModuleRegistry,
    PinnedRowModule,
    createGrid,
    enableDevValidations,
} from 'ag-grid-community';
import { PdfExportModule, RowGroupingModule } from 'ag-grid-enterprise';

// Enable extended validations only for development
if (process.env.NODE_ENV !== 'production') {
    enableDevValidations();
}

ModuleRegistry.registerModules([ClientSideRowModelModule, PinnedRowModule, RowGroupingModule, PdfExportModule]);

interface ProjectData {
    division: string;
    team: string;
    project: string;
    owner: string;
    budget: number;
}

const rowData: ProjectData[] = [
    { division: 'Product', team: 'Grid', project: 'Column Tooling', owner: 'Ava', budget: 185000 },
    { division: 'Product', team: 'Grid', project: 'PDF Export', owner: 'Mateo', budget: 240000 },
    { division: 'Product', team: 'Charts', project: 'Financial Series', owner: 'Priya', budget: 210000 },
    { division: 'Operations', team: 'Cloud', project: 'Regional Hosting', owner: 'Noah', budget: 320000 },
    { division: 'Operations', team: 'Support', project: 'Service Portal', owner: 'Mei', budget: 145000 },
];

let gridApi: GridApi<ProjectData>;

const gridOptions: GridOptions<ProjectData> = {
    columnDefs: [
        { field: 'division', rowGroup: true, hide: true },
        { field: 'team', rowGroup: true, hide: true },
        { field: 'project', minWidth: 180 },
        { field: 'owner' },
        { field: 'budget', valueFormatter: (params) => `$${Number(params.value).toLocaleString()}` },
    ],
    defaultColDef: { flex: 1, minWidth: 110 },
    autoGroupColumnDef: { headerName: 'Portfolio', minWidth: 220 },
    groupDefaultExpanded: -1,
    rowData,
    pinnedTopRowData: [{ division: '', team: '', project: 'Approved Portfolio', owner: 'Leadership', budget: 1100000 }],
    pinnedBottomRowData: [{ division: '', team: '', project: 'Contingency', owner: 'Finance', budget: 125000 }],
};

function onBtExport() {
    const includeTop = document.querySelector<HTMLInputElement>('#includeTop')!.checked;
    const includeBottom = document.querySelector<HTMLInputElement>('#includeBottom')!.checked;

    gridApi.exportDataAsPdf({
        rowGroupIndentSize: 16,
        skipPinnedTop: !includeTop,
        skipPinnedBottom: !includeBottom,
    });
}

document.addEventListener('DOMContentLoaded', () => {
    gridApi = createGrid(document.querySelector<HTMLElement>('#myGrid')!, gridOptions);
});
