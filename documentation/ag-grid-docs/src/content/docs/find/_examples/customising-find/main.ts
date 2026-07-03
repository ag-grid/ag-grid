import type { FindChangedEvent, GridApi, GridOptions } from 'ag-grid-community';
import {
    ClientSideRowModelModule,
    ModuleRegistry,
    PaginationModule,
    PinnedRowModule,
    createGrid,
    enableDevValidations,
} from 'ag-grid-community';
import { FindModule, RowGroupingModule, RowGroupingPanelModule, ToolbarModule } from 'ag-grid-enterprise';

// Enable extended validations only for development
if (process.env.NODE_ENV !== 'production') {
    enableDevValidations();
}

ModuleRegistry.registerModules([
    FindModule,
    ToolbarModule,
    RowGroupingModule,
    RowGroupingPanelModule,
    PinnedRowModule,
    ClientSideRowModelModule,
    PaginationModule,
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
    pagination: true,
    paginationPageSize: 5,
    paginationPageSizeSelector: [5, 10],
    toolbar: {
        items: ['agRowGroupPanelToolbarItem', 'agFindToolbarItem'],
    },
    findOptions: {
        caseSensitive: true,
        currentPageOnly: true,
    },
    onFindChanged: (event: FindChangedEvent) => {
        const { activeMatch } = event;
        (document.getElementById('activeMatch') as HTMLElement).textContent = activeMatch
            ? `Active match: { pinned: ${activeMatch.node.rowPinned}, row index: ${activeMatch.node.rowIndex}, column: ${activeMatch.column?.getColId()}, match number in cell: ${activeMatch.numInMatch} }`
            : '';
    },
};

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

document.addEventListener('DOMContentLoaded', function () {
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);

    fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
        .then((response) => response.json())
        .then((data: IOlympicData[]) => gridApi!.setGridOption('rowData', data));
});
