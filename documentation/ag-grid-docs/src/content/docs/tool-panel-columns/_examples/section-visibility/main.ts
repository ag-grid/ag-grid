import { ClientSideRowModelModule } from 'ag-grid-community';
import { GridApi, GridOptions, IColumnToolPanel, createGrid } from 'ag-grid-community';
import { ModuleRegistry } from 'ag-grid-community';
import { ColumnsToolPanelModule } from 'ag-grid-enterprise';
import { MenuModule } from 'ag-grid-enterprise';

ModuleRegistry.registerModules([ClientSideRowModelModule, ColumnsToolPanelModule, MenuModule]);

let gridApi: GridApi<IOlympicData>;

const gridOptions: GridOptions<IOlympicData> = {
    columnDefs: [
        { headerName: 'Name', field: 'athlete', minWidth: 200 },
        { field: 'age', enableRowGroup: true },
        { field: 'country', minWidth: 200 },
        { field: 'year' },
        { field: 'date', suppressColumnsToolPanel: true, minWidth: 180 },
        { field: 'sport', minWidth: 200 },
        { field: 'gold', aggFunc: 'sum' },
        { field: 'silver', aggFunc: 'sum' },
        { field: 'bronze', aggFunc: 'sum' },
        { field: 'total', aggFunc: 'sum' },
    ],
    defaultColDef: {
        flex: 1,
        minWidth: 100,
        enablePivot: true,
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
                    suppressRowGroups: true,
                    suppressValues: true,
                    suppressPivots: true,
                    suppressPivotMode: true,
                    suppressColumnFilter: true,
                    suppressColumnSelectAll: true,
                    suppressColumnExpandAll: true,
                },
            },
        ],
        defaultToolPanel: 'columns',
    },
};

function showPivotModeSection() {
    var columnToolPanel = gridApi!.getToolPanelInstance('columns')!;
    columnToolPanel.setPivotModeSectionVisible(true);
}

function showRowGroupsSection() {
    var columnToolPanel = gridApi!.getToolPanelInstance('columns')!;
    columnToolPanel.setRowGroupsSectionVisible(true);
}

function showValuesSection() {
    var columnToolPanel = gridApi!.getToolPanelInstance('columns')!;
    columnToolPanel.setValuesSectionVisible(true);
}

function showPivotSection() {
    var columnToolPanel = gridApi!.getToolPanelInstance('columns')!;
    columnToolPanel.setPivotSectionVisible(true);
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    var gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);

    fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
        .then((response) => response.json())
        .then((data: IOlympicData[]) => gridApi!.setGridOption('rowData', data));
});
