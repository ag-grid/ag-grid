import type { FindChangedEvent, GetFindTextParams, GridApi, GridOptions } from 'ag-grid-community';
import {
    ClientSideRowModelModule,
    ModuleRegistry,
    PaginationModule,
    PinnedRowModule,
    ValidationModule,
    createGrid,
} from 'ag-grid-community';
import { FindModule, RowGroupingModule, RowGroupingPanelModule } from 'ag-grid-enterprise';

import { FindRenderer } from './findRenderer_typescript';

ModuleRegistry.registerModules([
    FindModule,
    RowGroupingModule,
    RowGroupingPanelModule,
    PinnedRowModule,
    ClientSideRowModelModule,
    PaginationModule,
    ValidationModule /* Development Only */,
]);

let gridApi: GridApi;

const gridOptions: GridOptions = {
    pinnedTopRowData: [{ athlete: 'Michael Phelps' }],
    pinnedBottomRowData: [{ athlete: 'Michael Phelps' }],
    columnDefs: [
        { field: 'athlete' },
        { field: 'country' },
        { field: 'sport' },
        {
            field: 'year',
            cellRenderer: FindRenderer,
            getFindText: (params: GetFindTextParams) => {
                const cellValue = params.getValueFormatted() ?? params.value?.toString();
                if (!cellValue?.length) {
                    return null;
                }
                return `Year is ${cellValue}`;
            },
        },
        { field: 'age', minWidth: 100 },
        { field: 'gold', minWidth: 100 },
        { field: 'silver', minWidth: 100 },
        { field: 'bronze', minWidth: 100 },
    ],
    defaultColDef: {
        enableRowGroup: true,
    },
    onFindChanged: (event: FindChangedEvent) => {
        const { activeMatch, totalMatches } = event;
        (document.getElementById('resultNum') as HTMLElement).textContent = activeMatch
            ? `${activeMatch.numOverall}/${totalMatches}`
            : '';
        (document.getElementById('resultPosition') as HTMLElement).textContent = activeMatch
            ? ` { pinned: ${activeMatch.node.rowPinned}, row index: ${activeMatch.node.rowIndex}, column: ${activeMatch.column.getColId()}, num in cell: ${activeMatch.numInMatch} }`
            : '';
        console.log('findChanged', event);
    },
    onGridReady: () => {
        (document.getElementById('find-text-box') as HTMLInputElement).addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                event.preventDefault();
                find();
                const backwards = event.shiftKey;
                if (backwards) {
                    previous();
                } else {
                    next();
                }
            }
        });
    },
    rowGroupPanelShow: 'always',
    pagination: true,
};

function find() {
    const findText = (document.getElementById('find-text-box') as HTMLInputElement).value;
    if (findText !== gridApi.getGridOption('findText')) {
        gridApi!.setGridOption('findText', findText);
    }
}

function next() {
    gridApi!.findNext();
}

function previous() {
    gridApi!.findPrevious();
}

function goToFind() {
    const num = Number((document.getElementById('find-goto') as HTMLInputElement).value);
    if (isNaN(num) || num < 0) {
        return;
    }
    gridApi!.findGoTo(num);
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);

    fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
        .then((response) => response.json())
        .then((data: IOlympicData[]) => gridApi!.setGridOption('rowData', data));
});
