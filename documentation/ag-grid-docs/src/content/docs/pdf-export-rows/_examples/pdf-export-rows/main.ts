import type { GridApi, GridOptions, PdfExportParams } from 'ag-grid-community';
import {
    ClientSideRowModelModule,
    ModuleRegistry,
    PinnedRowModule,
    RowSelectionModule,
    TextFilterModule,
    createGrid,
    enableDevValidations,
} from 'ag-grid-community';
import { PdfExportModule } from 'ag-grid-enterprise';

// Enable extended validations only for development
if (process.env.NODE_ENV !== 'production') {
    enableDevValidations();
}

ModuleRegistry.registerModules([
    ClientSideRowModelModule,
    PinnedRowModule,
    RowSelectionModule,
    TextFilterModule,
    PdfExportModule,
]);

interface ProjectData {
    id: string;
    employee: string;
    team: string;
    country: string;
    status: string;
}

const rowData: ProjectData[] = [
    { id: 'p1', employee: 'Asha Patel', team: 'Grid', country: 'United Kingdom', status: 'Active' },
    { id: 'p2', employee: 'Marc Dubois', team: 'Charts', country: 'France', status: 'Planning' },
    { id: 'p3', employee: 'Sofia Rossi', team: 'Grid', country: 'Italy', status: 'Active' },
    { id: 'p4', employee: 'Noah Williams', team: 'Cloud', country: 'United States', status: 'Planning' },
    { id: 'p5', employee: 'Mei Chen', team: 'Support', country: 'Singapore', status: 'Active' },
    { id: 'p6', employee: 'Lucas Silva', team: 'Grid', country: 'Brazil', status: 'Archived' },
];

let gridApi: GridApi<ProjectData>;

const gridOptions: GridOptions<ProjectData> = {
    columnDefs: [
        { field: 'employee', minWidth: 170 },
        { field: 'team' },
        { field: 'country', minWidth: 150 },
        { field: 'status' },
    ],
    defaultColDef: {
        flex: 1,
        minWidth: 110,
        filter: true,
    },
    getRowId: (params) => params.data.id,
    rowSelection: {
        mode: 'multiRow',
        headerCheckbox: false,
    },
    rowData,
    pinnedTopRowData: [
        {
            id: 'top',
            employee: 'Quarterly Plan',
            team: 'All Teams',
            country: 'Global',
            status: 'Summary',
        },
    ],
    pinnedBottomRowData: [
        {
            id: 'bottom',
            employee: 'Project Total',
            team: '4 Teams',
            country: '6 Countries',
            status: 'Summary',
        },
    ],
    onFirstDataRendered: () => {
        gridApi.getRowNode('p1')?.setSelected(true);
        gridApi.getRowNode('p3')?.setSelected(true);
    },
};

function isChecked(id: string): boolean {
    return document.querySelector<HTMLInputElement>(`#${id}`)!.checked;
}

function onBtExport() {
    const params: PdfExportParams = {
        onlySelected: isChecked('onlySelected'),
        exportedRows: isChecked('allRows') ? 'all' : 'filteredAndSorted',
        skipPinnedTop: isChecked('skipPinnedTop'),
        skipPinnedBottom: isChecked('skipPinnedBottom'),
        columnWidth: 'auto',
    };

    gridApi.exportDataAsPdf(params);
}

document.addEventListener('DOMContentLoaded', () => {
    gridApi = createGrid(document.querySelector<HTMLElement>('#myGrid')!, gridOptions);
});
