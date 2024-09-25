import { ClientSideRowModelModule } from 'ag-grid-community';
import { GridApi, GridOptions, IColumnToolPanel, createGrid } from 'ag-grid-community';
import { ModuleRegistry } from 'ag-grid-community';
import { ColumnsToolPanelModule } from 'ag-grid-enterprise';
import { MenuModule } from 'ag-grid-enterprise';
import { SetFilterModule } from 'ag-grid-enterprise';

ModuleRegistry.registerModules([ClientSideRowModelModule, ColumnsToolPanelModule, MenuModule, SetFilterModule]);

let gridApi: GridApi<IOlympicData>;

const gridOptions: GridOptions<IOlympicData> = {
    columnDefs: [
        {
            headerName: 'Athlete',
            children: [
                {
                    headerName: 'Name',
                    field: 'athlete',
                    minWidth: 200,
                    filter: 'agTextColumnFilter',
                },
                { field: 'age' },
                { field: 'country', minWidth: 200 },
            ],
        },
        {
            headerName: 'Competition',
            children: [{ field: 'year' }, { field: 'date', minWidth: 180 }],
        },
        { colId: 'sport', field: 'sport', minWidth: 200 },
        {
            headerName: 'Medals',
            children: [{ field: 'gold' }, { field: 'silver' }, { field: 'bronze' }, { field: 'total' }],
        },
    ],
    defaultColDef: {
        flex: 1,
        minWidth: 100,
        // allow every column to be aggregated
        enableValue: true,
        // allow every column to be grouped
        enableRowGroup: true,
        // allow every column to be pivoted
        enablePivot: true,
        filter: true,
    },
    autoGroupColumnDef: {
        minWidth: 200,
    },
    sideBar: {
        toolPanels: [
            {
                id: 'columns',
                labelDefault: 'Columns',
                labelKey: 'columns',
                iconKey: 'columns',
                toolPanel: 'agColumnsToolPanel',
                toolPanelParams: {
                    // prevents custom layout changing when columns are reordered in the grid
                    suppressSyncLayoutWithGrid: true,
                    // prevents columns being reordered from the columns tool panel
                    suppressColumnMove: true,
                },
            },
        ],
        defaultToolPanel: 'columns',
    },
};

var sortedToolPanelColumnDefs = [
    {
        headerName: 'Athlete',
        children: [{ field: 'age' }, { field: 'country' }, { headerName: 'Name', field: 'athlete' }],
    },
    {
        headerName: 'Competition',
        children: [{ field: 'date' }, { field: 'year' }],
    },
    {
        headerName: 'Medals',
        children: [{ field: 'bronze' }, { field: 'gold' }, { field: 'silver' }, { field: 'total' }],
    },
    { colId: 'sport', field: 'sport' },
];

function setCustomSortLayout() {
    var columnToolPanel = gridApi!.getToolPanelInstance('columns');
    columnToolPanel!.setColumnLayout(sortedToolPanelColumnDefs);
}

var customToolPanelColumnDefs = [
    {
        headerName: 'Dummy Group 1',
        children: [
            { field: 'age' },
            { headerName: 'Name', field: 'athlete' },
            {
                headerName: 'Dummy Group 2',
                children: [{ colId: 'sport' }, { field: 'country' }],
            },
        ],
    },
    {
        headerName: 'Medals',
        children: [
            { field: 'total' },
            { field: 'bronze' },
            {
                headerName: 'Dummy Group 3',
                children: [{ field: 'silver' }, { field: 'gold' }],
            },
        ],
    },
];

function setCustomGroupLayout() {
    var columnToolPanel = gridApi!.getToolPanelInstance('columns');
    columnToolPanel!.setColumnLayout(customToolPanelColumnDefs);
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    var gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);

    fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
        .then((response) => response.json())
        .then((data: IOlympicData[]) => gridApi!.setGridOption('rowData', data));
});
