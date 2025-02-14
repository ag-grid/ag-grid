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
        const { activeMatch, totalMatches } = event;
        (document.getElementById('resultNum') as HTMLElement).textContent = activeMatch
            ? `${activeMatch.numOverall}/${totalMatches}`
            : '';
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
};

function find() {
    const findSearchValue = (document.getElementById('find-text-box') as HTMLInputElement).value;
    if (findSearchValue !== gridApi.getGridOption('findSearchValue')) {
        gridApi!.setGridOption('findSearchValue', findSearchValue);
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
});
