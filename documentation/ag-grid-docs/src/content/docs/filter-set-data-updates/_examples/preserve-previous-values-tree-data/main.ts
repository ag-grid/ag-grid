import type { FirstDataRenderedEvent, GridApi, GridOptions, KeyCreatorParams } from 'ag-grid-community';
import { ClientSideRowModelModule, ModuleRegistry, createGrid, enableDevValidations } from 'ag-grid-community';
import { ColumnMenuModule, FiltersToolPanelModule, SetFilterModule, TreeDataModule } from 'ag-grid-enterprise';

if (process.env.NODE_ENV !== 'production') {
    // Enable extended validations only for development
    enableDevValidations();
}

ModuleRegistry.registerModules([
    ClientSideRowModelModule,
    ColumnMenuModule,
    FiltersToolPanelModule,
    SetFilterModule,
    TreeDataModule,
]);

let gridApi: GridApi;

const gridOptions: GridOptions = {
    columnDefs: [{ field: 'size' }],
    autoGroupColumnDef: {
        headerName: 'File',
        minWidth: 250,
        filter: 'agSetColumnFilter',
        floatingFilter: true,
        filterParams: {
            treeList: true,
            keyCreator: (params: KeyCreatorParams) => (params.value ? params.value.join('/') : null),
            preservePreviousValues: true,
        },
    },
    treeData: true,
    getDataPath: (data) => data.path,
    groupDefaultExpanded: -1,
    sideBar: {
        toolPanels: [
            {
                id: 'filters',
                labelDefault: 'Filters',
                labelKey: 'filters',
                iconKey: 'filter',
                toolPanel: 'agFiltersToolPanel',
                toolPanelParams: { suppressSyncLayoutWithGrid: true },
            },
        ],
        defaultToolPanel: 'filters',
    },
    rowData: getRowData(),
    onFirstDataRendered: onFirstDataRendered,
};

function getRowData() {
    return [
        { path: ['Applications'] },
        { path: ['Applications', 'Calculator.app'], size: 8200 },
        { path: ['Applications', 'Calendar.app'], size: 14600 },
        { path: ['Desktop'] },
        { path: ['Desktop', 'screenshot.png'], size: 940 },
        { path: ['Desktop', 'todo.txt'], size: 2 },
        { path: ['Documents'] },
        { path: ['Documents', 'report.pdf'], size: 120 },
        { path: ['Documents', 'notes.txt'], size: 4 },
        { path: ['Documents', 'budget.xlsx'], size: 56 },
        { path: ['Downloads'] },
        { path: ['Downloads', 'installer.dmg'], size: 86000 },
        { path: ['Downloads', 'manual.pdf'], size: 3100 },
        { path: ['Music'] },
        { path: ['Music', 'playlist.m3u'], size: 3 },
        { path: ['Music', 'song.mp3'], size: 5200 },
        { path: ['Pictures'] },
        { path: ['Pictures', 'beach.jpg'], size: 2400 },
        { path: ['Pictures', 'city.jpg'], size: 1800 },
        { path: ['Pictures', 'sunset.jpg'], size: 2100 },
        { path: ['Projects'] },
        { path: ['Projects', 'website.zip'], size: 14200 },
        { path: ['Projects', 'roadmap.docx'], size: 64 },
        { path: ['Public'] },
        { path: ['Public', 'readme.txt'], size: 1 },
        { path: ['Public', 'shared.pdf'], size: 420 },
        { path: ['Recordings'] },
        { path: ['Recordings', 'interview.m4a'], size: 18400 },
        { path: ['Recordings', 'meeting.m4a'], size: 32600 },
        { path: ['Shared'] },
        { path: ['Shared', 'invoice-2025.pdf'], size: 92 },
        { path: ['Shared', 'team-photo.jpg'], size: 3300 },
        { path: ['Templates'] },
        { path: ['Templates', 'letter.dotx'], size: 38 },
        { path: ['Templates', 'slides.potx'], size: 720 },
        { path: ['Videos'] },
        { path: ['Videos', 'holiday.mp4'], size: 184000 },
        { path: ['Videos', 'tutorial.mov'], size: 96000 },
    ];
}

function selectReportAndArchive() {
    // 'Archive/old.zip' is not in the data, so it is listed by its key.
    gridApi!.setFilterModel({
        'ag-Grid-AutoColumn': { filterType: 'set', values: ['Documents/report.pdf', 'Archive/old.zip'] },
    });
}

function removeBeach() {
    gridApi!.setGridOption(
        'rowData',
        gridApi!.getGridOption('rowData')!.filter((row) => row.path[1] !== 'beach.jpg')
    );
}

function removeDocuments() {
    gridApi!.setGridOption(
        'rowData',
        gridApi!.getGridOption('rowData')!.filter((row) => row.path[0] !== 'Documents')
    );
}

function restoreData() {
    gridApi!.setGridOption('rowData', getRowData());
}

function clearPreservedValues() {
    gridApi!.doFilterAction({ colId: 'ag-Grid-AutoColumn', action: 'clearPreservedValues' });
}

function reset() {
    gridApi!.setFilterModel(null);
    gridApi!.setGridOption('rowData', getRowData());
    gridApi!.doFilterAction({ colId: 'ag-Grid-AutoColumn', action: 'clearPreservedValues' });
}

function onFirstDataRendered(params: FirstDataRenderedEvent) {
    const filtersToolPanel = params.api.getToolPanelInstance('filters')!;
    // The Filters Tool Panel lists only primary columns unless given a layout.
    filtersToolPanel.setFilterLayout([{ colId: 'ag-Grid-AutoColumn' }]);
    filtersToolPanel.expandFilters(['ag-Grid-AutoColumn']);
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);
});
