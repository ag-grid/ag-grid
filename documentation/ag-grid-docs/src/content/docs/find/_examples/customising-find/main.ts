import type { FindChangedEvent, GridApi, GridOptions } from 'ag-grid-community';
import {
    ClientSideRowModelModule,
    ModuleRegistry,
    PaginationModule,
    PinnedRowModule,
    ValidationModule,
    createGrid,
} from 'ag-grid-community';
import { FindModule, RowGroupingModule, RowGroupingPanelModule } from 'ag-grid-enterprise';

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
    pinnedTopRowData: [{ athlete: 'Top' }],
    pinnedBottomRowData: [{ athlete: 'Bottom' }],
    columnDefs: [
        { field: 'athlete' },
        { field: 'country' },
        { field: 'sport', rowGroup: true, hide: true },
        { field: 'year' },
        { field: 'age', minWidth: 100 },
        { field: 'gold', minWidth: 100 },
        { field: 'silver', minWidth: 100 },
        { field: 'bronze', minWidth: 100 },
    ],
    defaultColDef: {
        enableRowGroup: true,
    },
    rowGroupPanelShow: 'always',
    pagination: true,
    paginationPageSize: 5,
    paginationPageSizeSelector: [5, 10],
    findOptions: {
        caseSensitive: true,
        currentPageOnly: true,
    },
    onFindChanged: (event: FindChangedEvent) => {
        const { activeMatch, totalMatches, findSearchValue } = event;
        (document.getElementById('activeMatchNum') as HTMLElement).textContent = findSearchValue?.length
            ? `${activeMatch?.numOverall ?? 0}/${totalMatches}`
            : '';
        (document.getElementById('activeMatch') as HTMLElement).textContent = activeMatch
            ? `Active match: { pinned: ${activeMatch.node.rowPinned}, row index: ${activeMatch.node.rowIndex}, column: ${activeMatch.column.getColId()}, match number in cell: ${activeMatch.numInMatch} }`
            : '';
    },
};

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

function toggleCaseSensitive() {
    const caseSensitive = (document.getElementById('caseSensitive') as HTMLInputElement).checked;
    const findOptions = gridApi.getGridOption('findOptions');
    gridApi.setGridOption('findOptions', {
        ...findOptions,
        caseSensitive,
    });
}

function toggleCurrentPageOnly() {
    const currentPageOnly = (document.getElementById('currentPageOnly') as HTMLInputElement).checked;
    const findOptions = gridApi.getGridOption('findOptions');
    gridApi.setGridOption('findOptions', {
        ...findOptions,
        currentPageOnly,
    });
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);

    fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
        .then((response) => response.json())
        .then((data: IOlympicData[]) => gridApi!.setGridOption('rowData', data));

    const findInput = document.getElementById('find-text-box') as HTMLInputElement;
    findInput.addEventListener('input', (event) => {
        gridApi.setGridOption('findSearchValue', (event.target as HTMLInputElement).value);
    });
    findInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            const backwards = event.shiftKey;
            if (backwards) {
                previous();
            } else {
                next();
            }
        }
    });
});
