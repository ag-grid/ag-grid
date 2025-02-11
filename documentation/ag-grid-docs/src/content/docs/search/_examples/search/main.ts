import type { GetSearchTextParams, GridApi, GridOptions, SearchChangedEvent } from 'ag-grid-community';
import {
    ClientSideRowModelModule,
    ModuleRegistry,
    PaginationModule,
    PinnedRowModule,
    SearchModule,
    ValidationModule,
    createGrid,
} from 'ag-grid-community';
import { RowGroupingModule, RowGroupingPanelModule } from 'ag-grid-enterprise';

import { SearchRenderer } from './searchRenderer_typescript';

ModuleRegistry.registerModules([
    SearchModule,
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
            cellRenderer: SearchRenderer,
            getSearchText: (params: GetSearchTextParams) => {
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
    onSearchChanged: (event: SearchChangedEvent) => {
        const { activeMatch, totalMatches } = event;
        (document.getElementById('resultNum') as HTMLElement).textContent = activeMatch
            ? `${activeMatch.numOverall}/${totalMatches}`
            : '';
        (document.getElementById('resultPosition') as HTMLElement).textContent = activeMatch
            ? ` { pinned: ${activeMatch.node.rowPinned}, row index: ${activeMatch.node.rowIndex}, column: ${activeMatch.column.getColId()}, num in cell: ${activeMatch.numInMatch} }`
            : '';
        console.log('searchChanged', event);
    },
    onGridReady: () => {
        (document.getElementById('search-text-box') as HTMLInputElement).addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                event.preventDefault();
                search();
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

function search() {
    const searchText = (document.getElementById('search-text-box') as HTMLInputElement).value;
    if (searchText !== gridApi.getGridOption('searchText')) {
        gridApi!.setGridOption('searchText', searchText);
    }
}

function next() {
    gridApi!.searchNext();
}

function previous() {
    gridApi!.searchPrevious();
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);

    fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
        .then((response) => response.json())
        .then((data: IOlympicData[]) => gridApi!.setGridOption('rowData', data));
});
