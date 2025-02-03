import type { GridApi, GridOptions, SearchChangedEvent } from 'ag-grid-community';
import {
    ClientSideRowModelModule,
    ModuleRegistry,
    PinnedRowModule,
    SearchModule,
    ValidationModule,
    createGrid,
} from 'ag-grid-community';
import { RowGroupingModule, RowGroupingPanelModule } from 'ag-grid-enterprise';

ModuleRegistry.registerModules([
    SearchModule,
    RowGroupingModule,
    RowGroupingPanelModule,
    PinnedRowModule,
    ClientSideRowModelModule,
    ValidationModule /* Development Only */,
]);

let gridApi: GridApi;

let searchText: string;

const gridOptions: GridOptions = {
    pinnedTopRowData: [{ athlete: 'Michael Phelps' }],
    pinnedBottomRowData: [{ athlete: 'Michael Phelps' }],
    columnDefs: [
        { field: 'athlete' },
        { field: 'country' },
        { field: 'sport' },
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
};

function search() {
    const newSearchText = (document.getElementById('search-text-box') as HTMLInputElement).value;
    if (newSearchText !== searchText) {
        searchText = newSearchText;
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
