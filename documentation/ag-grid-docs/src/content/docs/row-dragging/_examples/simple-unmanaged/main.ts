import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import { GetRowIdParams, GridApi, GridOptions, RowDragMoveEvent, createGrid } from '@ag-grid-community/core';
import { ModuleRegistry } from '@ag-grid-community/core';

import { getData } from './data';

ModuleRegistry.registerModules([ClientSideRowModelModule]);

var immutableStore: any[] = getData();

let gridApi: GridApi;

const gridOptions: GridOptions = {
    columnDefs: [
        { field: 'athlete', rowDrag: true },
        { field: 'country' },
        { field: 'year', width: 100 },
        { field: 'date' },
        { field: 'sport' },
        { field: 'gold' },
        { field: 'silver' },
        { field: 'bronze' },
    ],
    defaultColDef: {
        width: 170,
        filter: true,
    },
    // this tells the grid we are doing updates when setting new data
    onRowDragMove: onRowDragMove,
    getRowId: getRowId,
    onSortChanged: onSortChanged,
    onFilterChanged: onFilterChanged,
    onGridReady: (params) => {
        // add id to each item, needed for immutable store to work
        immutableStore.forEach(function (data, index) {
            data.id = index;
        });

        params.api.setGridOption('rowData', immutableStore);
    },
};

var sortActive = false;
var filterActive = false;

// listen for change on sort changed
function onSortChanged() {
    var colState = gridApi!.getColumnState() || [];
    sortActive = colState.some((c) => c.sort);
    // suppress row drag if either sort or filter is active
    var suppressRowDrag = sortActive || filterActive;
    console.log(
        'sortActive = ' + sortActive + ', filterActive = ' + filterActive + ', allowRowDrag = ' + suppressRowDrag
    );
    gridApi!.setGridOption('suppressRowDrag', suppressRowDrag);
}

// listen for changes on filter changed
function onFilterChanged() {
    filterActive = gridApi!.isAnyFilterPresent();
    // suppress row drag if either sort or filter is active
    var suppressRowDrag = sortActive || filterActive;
    console.log(
        'sortActive = ' + sortActive + ', filterActive = ' + filterActive + ', allowRowDrag = ' + suppressRowDrag
    );
    gridApi!.setGridOption('suppressRowDrag', suppressRowDrag);
}

function getRowId(params: GetRowIdParams) {
    return String(params.data.id);
}

function onRowDragMove(event: RowDragMoveEvent) {
    var movingNode = event.node;
    var overNode = event.overNode;

    var rowNeedsToMove = movingNode !== overNode;

    if (rowNeedsToMove) {
        // the list of rows we have is data, not row nodes, so extract the data
        var movingData = movingNode.data;
        var overData = overNode!.data;

        var fromIndex = immutableStore.indexOf(movingData);
        var toIndex = immutableStore.indexOf(overData);

        var newStore = immutableStore.slice();
        moveInArray(newStore, fromIndex, toIndex);

        immutableStore = newStore;
        gridApi!.setGridOption('rowData', newStore);

        gridApi!.clearFocusedCell();
    }

    function moveInArray(arr: any[], fromIndex: number, toIndex: number) {
        var element = arr[fromIndex];
        arr.splice(fromIndex, 1);
        arr.splice(toIndex, 0, element);
    }
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    var gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);
});
