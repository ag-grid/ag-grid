import type { GridApi, GridOptions, PdfExportParams } from 'ag-grid-community';
import {
    ClientSideRowModelModule,
    ModuleRegistry,
    PinnedRowModule,
    RowAutoHeightModule,
    createGrid,
    enableDevValidations,
} from 'ag-grid-community';
import { ContextMenuModule, PdfExportModule, RowGroupingModule } from 'ag-grid-enterprise';

if (process.env.NODE_ENV !== 'production') {
    // Enable extended validations only for development
    enableDevValidations();
}

ModuleRegistry.registerModules([
    ClientSideRowModelModule,
    PinnedRowModule,
    RowAutoHeightModule,
    RowGroupingModule,
    ContextMenuModule,
    PdfExportModule,
]);

interface ProjectData {
    division: string;
    team: string;
    project: string;
    summary: string;
    owner: string;
    budget: number;
}

const rowData: ProjectData[] = [
    {
        division: 'Product',
        team: 'Grid',
        project: 'Column Tooling',
        summary: 'Improve column workflows.\nAdd keyboard controls.',
        owner: 'Ava',
        budget: 185000,
    },
    {
        division: 'Product',
        team: 'Grid',
        project: 'PDF Export',
        summary: 'Deliver paginated reports with configurable widths, wrapping, styling, and extra content.',
        owner: 'Mateo',
        budget: 240000,
    },
    {
        division: 'Product',
        team: 'Charts',
        project: 'Financial Series',
        summary: 'Add range, volume, and technical-indicator workflows for financial dashboards.',
        owner: 'Priya',
        budget: 210000,
    },
    {
        division: 'Operations',
        team: 'Cloud',
        project: 'Regional Hosting',
        summary: 'Expand regional hosting capacity while keeping deployment and monitoring consistent.',
        owner: 'Noah',
        budget: 320000,
    },
    {
        division: 'Operations',
        team: 'Support',
        project: 'Service Portal',
        summary: 'Consolidate customer requests, service status, and escalation history into one portal.',
        owner: 'Mei',
        budget: 145000,
    },
];

let gridApi: GridApi<ProjectData>;

const gridOptions: GridOptions<ProjectData> = {
    columnDefs: [
        { field: 'division', rowGroup: true, hide: true },
        { field: 'team', rowGroup: true, hide: true },
        { field: 'project', minWidth: 180 },
        { field: 'summary', minWidth: 260, wrapText: true, autoHeight: true },
        { field: 'owner' },
        { field: 'budget', valueFormatter: (params) => `$${Number(params.value).toLocaleString()}` },
    ],
    defaultColDef: { flex: 1, minWidth: 110 },
    autoGroupColumnDef: { headerName: 'Portfolio', minWidth: 220 },
    groupDefaultExpanded: -1,
    rowData,
    pinnedTopRowData: [
        {
            division: '',
            team: '',
            project: 'Approved Portfolio',
            summary: 'Current approved programme of work',
            owner: 'Leadership',
            budget: 1100000,
        },
    ],
    pinnedBottomRowData: [
        {
            division: '',
            team: '',
            project: 'Contingency',
            summary: 'Unallocated portfolio contingency',
            owner: 'Finance',
            budget: 125000,
        },
    ],
};

function getPdfExportParams(): PdfExportParams {
    const includeTop = document.querySelector<HTMLInputElement>('#includeTop')!.checked;
    const includeBottom = document.querySelector<HTMLInputElement>('#includeBottom')!.checked;
    const limitLines = document.querySelector<HTMLInputElement>('#limitLines')!.checked;

    return {
        rowGroupIndentSize: 16,
        skipPinnedTop: !includeTop,
        skipPinnedBottom: !includeBottom,
        defaultCellStyle: {
            maxLines: limitLines ? 2 : undefined,
            overflow: 'ellipsis',
        },
        columnWidth: ({ column }) => (column?.getColId() === 'summary' ? 190 : 'auto'),
    };
}

function updateDefaultPdfExportParams() {
    gridApi.setGridOption('defaultPdfExportParams', getPdfExportParams());
}

function onBtExport() {
    updateDefaultPdfExportParams();
    gridApi.exportDataAsPdf();
}

document.addEventListener('DOMContentLoaded', () => {
    gridApi = createGrid(document.querySelector<HTMLElement>('#myGrid')!, gridOptions);
    updateDefaultPdfExportParams();
    for (const id of ['includeTop', 'includeBottom', 'limitLines']) {
        document.querySelector(`#${id}`)!.addEventListener('change', updateDefaultPdfExportParams);
    }
});
