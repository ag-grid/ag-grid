import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import { ColumnState, GridApi, GridOptions, createGrid } from '@ag-grid-community/core';
import { ModuleRegistry } from '@ag-grid-community/core';
import { ColumnsToolPanelModule } from '@ag-grid-enterprise/column-tool-panel';
import { FiltersToolPanelModule } from '@ag-grid-enterprise/filter-tool-panel';
import { MenuModule } from '@ag-grid-enterprise/menu';
import { RowGroupingModule } from '@ag-grid-enterprise/row-grouping';
import { SetFilterModule } from '@ag-grid-enterprise/set-filter';

ModuleRegistry.registerModules([
    ClientSideRowModelModule,
    ColumnsToolPanelModule,
    FiltersToolPanelModule,
    MenuModule,
    RowGroupingModule,
    SetFilterModule,
]);

let gridApi: GridApi<IOlympicData>;

const gridOptions: GridOptions<IOlympicData> = {
    columnDefs: [
        { field: 'athlete', enableRowGroup: true, enablePivot: true },
        { field: 'age', enableValue: true },
        { field: 'country', enableRowGroup: true, enablePivot: true, rowGroup: true },
        { field: 'year', enableRowGroup: true, enablePivot: true },
        { field: 'date', enableRowGroup: true, enablePivot: true },
        { field: 'sport', enableRowGroup: true, enablePivot: true, pivot: true },
        { field: 'gold', enableValue: true, aggFunc: 'sum' },
        { field: 'silver', enableValue: true, aggFunc: 'sum' },
        { field: 'bronze', enableValue: true },
        { field: 'total', enableValue: true },
    ],
    defaultColDef: {
        flex: 1,
        minWidth: 150,
        filter: true,
    },
    autoGroupColumnDef: {
        minWidth: 300,
    },
    sideBar: true,
    pivotMode: true,
};

var savedState: ColumnState[];
var savedPivotMode: boolean;

function printState() {
    var state = gridApi!.getColumnState();
    console.log(state);
}

function saveState() {
    savedState = gridApi!.getColumnState();
    savedPivotMode = gridApi!.isPivotMode();
    console.log('column state saved');
}

function restoreState() {
    if (savedState) {
        // Pivot mode must be set first otherwise the columns we're trying to set state for won't exist yet
        gridApi!.setGridOption('pivotMode', savedPivotMode);
        gridApi!.applyColumnState({ state: savedState, applyOrder: true });
        console.log('column state restored');
    } else {
        console.log('no previous column state to restore!');
    }
}

function togglePivotMode() {
    var pivotMode = gridApi!.isPivotMode();
    gridApi!.setGridOption('pivotMode', !pivotMode);
}

function resetState() {
    gridApi!.resetColumnState();
    gridApi!.setGridOption('pivotMode', false);
    console.log('column state reset');
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    var gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);

    fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
        .then((response) => response.json())
        .then((data: IOlympicData[]) => gridApi!.setGridOption('rowData', data));
});
